const express = require("express");

function createRobloxRouter({ commandBus }) {
  const router = express.Router();

  router.post("/bootstrap", async (req, res) => {
    const serverInfo = req.body || {};
    const bootstrap = await commandBus.getBootstrapState();

    await commandBus.writeLog({
      category: "join",
      event: "roblox.bootstrap",
      actor: { id: serverInfo.serverId || "", tag: `server:${serverInfo.serverId || "unknown"}`, rank: "System" },
      target: {},
      message: `Server ${serverInfo.serverId || "unknown"} connected`,
      meta: serverInfo
    });

    res.json({
      ok: true,
      data: bootstrap
    });
  });

  router.post("/commands/poll", async (req, res) => {
    const scope = req.body || {};
    const commands = await commandBus.claimCommands(scope, Number(scope.limit || 5));
    res.json({ ok: true, data: commands });
  });

  router.post("/commands/result", async (req, res) => {
    const body = req.body || {};
    await commandBus.completeCommand(body.nonce, body);
    res.json({ ok: true });
  });

  router.post("/logs", async (req, res) => {
    await commandBus.ingestRobloxLogs(Array.isArray(req.body?.logs) ? req.body.logs : []);
    res.json({ ok: true });
  });

  router.post("/snapshot", async (req, res) => {
    const snapshot = await commandBus.upsertSnapshot(req.body || {});
    res.json({ ok: true, data: snapshot });
  });

  return router;
}

module.exports = createRobloxRouter;
