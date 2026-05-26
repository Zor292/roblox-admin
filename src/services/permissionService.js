const { getCommand, rankPower } = require("../shared/commandCatalog");

class PermissionService {
  constructor(env) {
    this.env = env;
  }

  resolveDiscordRank(member) {
    if (!member) {
      return { rank: "Support", power: rankPower.Support };
    }

    const userId = member.user?.id || member.id;
    const roleIds = new Set(member.roles?.cache?.map((role) => role.id) || []);

    if (this.env.idLists.ownerIds.includes(userId)) {
      return { rank: "Owner", power: rankPower.Owner };
    }

    if (this.env.idLists.developerIds.includes(userId)) {
      return { rank: "Developer", power: rankPower.Developer };
    }

    if (hasAny(roleIds, this.env.idLists.headAdminRoleIds)) {
      return { rank: "Head Admin", power: rankPower["Head Admin"] };
    }

    if (hasAny(roleIds, this.env.idLists.adminRoleIds)) {
      return { rank: "Admin", power: rankPower.Admin };
    }

    if (hasAny(roleIds, this.env.idLists.moderatorRoleIds)) {
      return { rank: "Moderator", power: rankPower.Moderator };
    }

    if (hasAny(roleIds, this.env.idLists.supportRoleIds)) {
      return { rank: "Support", power: rankPower.Support };
    }

    if (member.permissions?.has?.("Administrator")) {
      return { rank: "Head Admin", power: rankPower["Head Admin"] };
    }

    return { rank: "Support", power: rankPower.Support };
  }

  canUse(member, commandName) {
    const command = getCommand(commandName);
    if (!command) {
      return false;
    }

    const actor = this.resolveDiscordRank(member);
    return actor.power >= rankPower[command.requiredRank];
  }
}

function hasAny(roleIds, allowedIds) {
  return allowedIds.some((entry) => roleIds.has(entry));
}

module.exports = PermissionService;
