const http = require("http");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const env = require("./config/env");
const { connectDatabase } = require("./database/mongoose");
const CommandBus = require("./services/commandBus");
const DiscordLogService = require("./services/discordLogService");
const PermissionService = require("./services/permissionService");
const { createRobloxAuth, createDashboardAuth } = require("./api/middleware/auth");
const createRobloxRouter = require("./api/routes/roblox");
const createDashboardRouter = require("./api/routes/dashboard");
const startDiscordBot = require("./bot/client");

async function main() {
  await connectDatabase(env.MONGODB_URI);

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: true, credentials: true }
  });

  const discordLogService = new DiscordLogService(env);
  const commandBus = new CommandBus({ env, io, discordLogService });
  const permissionService = new PermissionService(env);

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.static(path.join(__dirname, "dashboard", "public")));

  app.get("/health", (req, res) => {
    res.json({ ok: true, service: "roblox-admin-suite" });
  });

  app.use("/v1/roblox", createRobloxAuth(env), createRobloxRouter({ commandBus }));
  const dashboardRouter = createDashboardRouter({ env, commandBus });
  app.use("/v1/dashboard", createDashboardAuth(env), dashboardRouter);

  io.on("connection", (socket) => {
    socket.emit("system:ready", { ok: true });
  });

  await startDiscordBot({ env, commandBus, permissionService });

  server.listen(env.PORT, () => {
    process.stdout.write(`Backend listening on ${env.PORT}\n`);
  });
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
