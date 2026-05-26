const crypto = require("crypto");
const Command = require("../database/models/Command");
const AuditLog = require("../database/models/AuditLog");
const Rank = require("../database/models/Rank");
const Ban = require("../database/models/Ban");
const Warning = require("../database/models/Warning");
const ServerSnapshot = require("../database/models/ServerSnapshot");
const { createRobloxIdentity, normalizeUsername } = require("../utils/identity");

class CommandBus {
  constructor({ env, io, discordLogService }) {
    this.env = env;
    this.io = io;
    this.discordLogService = discordLogService;
    this.waiters = new Map();
  }

  async queueCommand({ commandName, args = {}, actor, source, scope = {} }) {
    const nonce = crypto.randomUUID();
    const targetIdentity = createRobloxIdentity({
      userId: args.targetUserId,
      username: args.player
    });

    if (commandName === "setrank") {
      await Rank.findOneAndUpdate(
        {
          $or: [
            { "robloxIdentity.userId": targetIdentity.userId || -1 },
            { "robloxIdentity.usernameLower": targetIdentity.usernameLower || "__none__" }
          ]
        },
        {
          robloxIdentity: targetIdentity,
          rank: args.rank,
          updatedBy: actor
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    if (commandName === "ban") {
      const durationMinutes = Number(args.duration_minutes || 0) || 0;
      const expiresAt = durationMinutes > 0 ? new Date(Date.now() + durationMinutes * 60000) : null;
      await Ban.findOneAndUpdate(
        {
          $or: [
            { "robloxIdentity.userId": targetIdentity.userId || -1 },
            { "robloxIdentity.usernameLower": targetIdentity.usernameLower || "__none__" }
          ]
        },
        {
          robloxIdentity: targetIdentity,
          reason: args.reason || "",
          durationMinutes,
          expiresAt,
          active: true,
          createdBy: actor,
          revokedBy: null,
          revokedAt: null
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    if (commandName === "unban") {
      await Ban.updateMany(
        {
          $or: [
            { "robloxIdentity.userId": targetIdentity.userId || -1 },
            { "robloxIdentity.usernameLower": targetIdentity.usernameLower || "__none__" }
          ]
        },
        {
          active: false,
          revokedBy: actor,
          revokedAt: new Date()
        }
      );
    }

    if (commandName === "warn") {
      await Warning.create({
        robloxIdentity: targetIdentity,
        reason: args.reason || "",
        createdBy: actor
      });
    }

    const command = await Command.create({
      nonce,
      commandName,
      args,
      source,
      actor,
      target: targetIdentity,
      scope,
      status: "queued"
    });

    await this.writeLog({
      category: commandName === "ban" || commandName === "unban" ? "ban" : "admin",
      event: `command.${commandName}.queued`,
      actor,
      target: targetIdentity,
      message: `${commandName} queued`,
      meta: { source, scope, args }
    });

    this.io.emit("queue:update", { nonce, commandName, source, args });
    return command.toObject();
  }

  waitForResult(nonce, timeoutMs = this.env.COMMAND_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiters.delete(nonce);
        reject(new Error("Command result timed out"));
      }, timeoutMs);

      this.waiters.set(nonce, { resolve, reject, timer });
    });
  }

  async claimCommands(scope = {}, limit = 5) {
    const claimed = [];

    for (let index = 0; index < limit; index += 1) {
      const query = {
        status: "queued",
        $or: [{ "scope.serverId": { $exists: false } }, { "scope.serverId": "" }, { "scope.serverId": scope.serverId || "" }]
      };

      const command = await Command.findOneAndUpdate(
        query,
        { status: "dispatched", dispatchedAt: new Date() },
        { sort: { createdAt: 1 }, new: true }
      ).lean();

      if (!command) {
        break;
      }

      claimed.push(command);
    }

    return claimed;
  }

  async completeCommand(nonce, payload = {}) {
    const status = payload.ok === false ? "failed" : "completed";
    const command = await Command.findOneAndUpdate(
      { nonce },
      { status, completedAt: new Date(), result: payload },
      { new: true }
    ).lean();

    await this.writeLog({
      category: payload.category || "admin",
      event: `command.${command?.commandName || "unknown"}.completed`,
      actor: command?.actor || {},
      target: command?.target || {},
      message: payload.message || `${command?.commandName || "command"} completed`,
      meta: {
        nonce,
        ok: payload.ok !== false,
        result: payload
      }
    });

    const waiter = this.waiters.get(nonce);
    if (waiter) {
      clearTimeout(waiter.timer);
      this.waiters.delete(nonce);
      waiter.resolve(command);
    }

    this.io.emit("command:result", command);
    return command;
  }

  async writeLog(entry) {
    const created = await AuditLog.create(entry);
    const payload = created.toObject();
    this.io.emit("log:new", payload);
    await this.discordLogService.send(
      payload.category,
      payload.event,
      payload.message || payload.event,
      [
        { name: "Actor", value: payload.actor?.tag || payload.actor?.rank || "-", inline: true },
        { name: "Target", value: payload.target?.username || "-", inline: true },
        { name: "Time", value: new Date(payload.createdAt).toISOString(), inline: false }
      ]
    );
    return payload;
  }

  async ingestRobloxLogs(logs = []) {
    for (const log of logs) {
      await this.writeLog({
        category: log.category || "system",
        event: log.event || "roblox.log",
        actor: log.actor || {},
        target: log.target || {},
        message: log.message || "",
        meta: log.meta || {}
      });
    }
  }

  async getBootstrapState() {
    const activeBans = await Ban.find({
      active: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }]
    })
      .sort({ updatedAt: -1 })
      .lean();

    const ranks = await Rank.find({}).sort({ updatedAt: -1 }).lean();

    const rankMap = {};
    for (const row of ranks) {
      const usernameLower = normalizeUsername(row.robloxIdentity?.usernameLower || row.robloxIdentity?.username);
      if (usernameLower) {
        rankMap[usernameLower] = row.rank;
      }
      if (row.robloxIdentity?.userId) {
        rankMap[String(row.robloxIdentity.userId)] = row.rank;
      }
    }

    return {
      activeBans: activeBans.map((row) => ({
        userId: row.robloxIdentity?.userId || 0,
        username: row.robloxIdentity?.username || "",
        usernameLower: row.robloxIdentity?.usernameLower || "",
        reason: row.reason || "",
        expiresUnix: row.expiresAt ? Math.floor(row.expiresAt.getTime() / 1000) : null
      })),
      rankMap
    };
  }

  async upsertSnapshot(payload = {}) {
    const snapshot = await ServerSnapshot.findOneAndUpdate(
      { serverId: payload.serverId },
      {
        serverId: payload.serverId,
        jobId: payload.jobId,
        placeId: String(payload.placeId || ""),
        universeId: String(payload.universeId || ""),
        playerCount: Number(payload.playerCount || 0),
        admins: Array.isArray(payload.admins) ? payload.admins : [],
        players: Array.isArray(payload.players) ? payload.players : [],
        state: payload.state || {}
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    this.io.emit("snapshot:update", snapshot);
    return snapshot;
  }

  async getDashboardBootstrap() {
    const [snapshots, logs, ranks, bans, commands] = await Promise.all([
      ServerSnapshot.find({}).sort({ updatedAt: -1 }).limit(10).lean(),
      AuditLog.find({}).sort({ createdAt: -1 }).limit(40).lean(),
      Rank.find({}).sort({ updatedAt: -1 }).limit(100).lean(),
      Ban.find({ active: true }).sort({ updatedAt: -1 }).limit(100).lean(),
      Command.find({}).sort({ createdAt: -1 }).limit(40).lean()
    ]);

    return { snapshots, logs, ranks, bans, commands };
  }
}

module.exports = CommandBus;
