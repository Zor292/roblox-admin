const express = require("express");
const jwt = require("jsonwebtoken");
const AuditLog = require("../../database/models/AuditLog");
const { catalog } = require("../../shared/commandCatalog");

function createDashboardRouter({ env, commandBus }) {
  const router = express.Router();

  router.post("/login", async (req, res) => {
    const username = String(req.body?.username || "");
    const password = String(req.body?.password || "");

    if (username !== env.DASHBOARD_USERNAME || password !== env.DASHBOARD_PASSWORD) {
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ username, rank: "Owner" }, env.DASHBOARD_JWT_SECRET, {
      expiresIn: "12h"
    });

    return res.json({ ok: true, token });
  });

  router.get("/bootstrap", async (req, res) => {
    const payload = await commandBus.getDashboardBootstrap();
    res.json({ ok: true, data: { ...payload, catalog } });
  });

  router.get("/logs", async (req, res) => {
    const query = {};
    if (req.query.category) {
      query.category = String(req.query.category);
    }
    const rows = await AuditLog.find(query).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ ok: true, data: rows });
  });

  router.post("/command", async (req, res) => {
    const body = req.body || {};
    const actor = {
      id: req.dashboardUser.username,
      tag: `dashboard:${req.dashboardUser.username}`,
      rank: req.dashboardUser.rank || "Owner"
    };

    const command = await commandBus.queueCommand({
      commandName: body.commandName,
      args: body.args || {},
      actor,
      source: "dashboard",
      scope: body.scope || {}
    });

    try {
      const result = await commandBus.waitForResult(command.nonce);
      return res.json({ ok: true, data: result });
    } catch (error) {
      return res.json({ ok: true, data: command, pending: true, message: error.message });
    }
  });

  return router;
}

module.exports = createDashboardRouter;
