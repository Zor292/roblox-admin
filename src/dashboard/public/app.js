const loginCard = document.getElementById("login-card");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const commandForm = document.getElementById("command-form");
const commandName = document.getElementById("command-name");
const commandPlayer = document.getElementById("command-player");
const commandReason = document.getElementById("command-reason");
const commandExtra = document.getElementById("command-extra");
const commandResult = document.getElementById("command-result");
const servers = document.getElementById("servers");
const logs = document.getElementById("logs");
const ranks = document.getElementById("ranks");
const bans = document.getElementById("bans");
const refreshButton = document.getElementById("refresh-button");

let authToken = localStorage.getItem("dashboard_token") || "";
let socket = null;
let catalog = [];

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  const payload = {
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value
  };

  const response = await fetch("/v1/dashboard/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  const json = await response.json();
  if (!json.ok) {
    loginError.textContent = json.message || "Login failed";
    return;
  }

  authToken = json.token;
  localStorage.setItem("dashboard_token", authToken);
  await loadDashboard();
});

commandForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const command = commandName.value;
  const payload = buildPayload(command);

  const response = await fetch("/v1/dashboard/command", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify(payload)
  });

  const json = await response.json();
  commandResult.textContent = JSON.stringify(json, null, 2);
});

refreshButton.addEventListener("click", () => {
  loadDashboard();
});

if (authToken) {
  loadDashboard();
}

async function loadDashboard() {
  const response = await fetch("/v1/dashboard/bootstrap", {
    headers: { authorization: `Bearer ${authToken}` }
  });

  if (response.status === 401) {
    authToken = "";
    localStorage.removeItem("dashboard_token");
    dashboard.classList.add("hidden");
    loginCard.classList.remove("hidden");
    return;
  }

  const json = await response.json();
  if (!json.ok) {
    return;
  }

  loginCard.classList.add("hidden");
  dashboard.classList.remove("hidden");
  catalog = json.data.catalog || [];
  hydrateCommandCatalog();
  renderServers(json.data.snapshots || []);
  renderLogs(json.data.logs || []);
  renderRanks(json.data.ranks || []);
  renderBans(json.data.bans || []);
  attachSocket();
}

function hydrateCommandCatalog() {
  commandName.innerHTML = "";
  for (const entry of catalog) {
    const option = document.createElement("option");
    option.value = entry.name;
    option.textContent = `${entry.name} · ${entry.requiredRank}`;
    commandName.appendChild(option);
  }
}

function buildPayload(command) {
  const args = {};
  const targetCommands = new Set([
    "ban",
    "kick",
    "warn",
    "mute",
    "unban",
    "freeze",
    "bring",
    "goto",
    "spectate",
    "playerinfo",
    "inventory",
    "job",
    "money",
    "alts",
    "session",
    "revive",
    "heal",
    "setrank",
    "setteam",
    "tpcoords",
    "vehicle",
    "clearitems"
  ]);

  if (targetCommands.has(command)) {
    args.player = commandPlayer.value.trim();
  }

  if (command === "ban" || command === "kick" || command === "warn" || command === "mute" || command === "unban") {
    args.reason = commandReason.value.trim();
  }

  if (command === "announce") {
    args.message = commandReason.value.trim();
  }

  if (command === "serverlock" || command === "freeze") {
    args.enabled = commandExtra.value.trim().toLowerCase() === "true" || commandExtra.value.trim() === "1";
    args.reason = commandReason.value.trim();
  }

  if (command === "setrank") {
    args.rank = commandReason.value.trim();
  }

  if (command === "setteam") {
    args.team = commandReason.value.trim();
  }

  if (command === "tpcoords") {
    const [x, y, z] = commandReason.value.split(",").map((entry) => Number(entry.trim()) || 0);
    args.x = x;
    args.y = y;
    args.z = z;
  }

  if (command === "vehicle") {
    args.model = commandReason.value.trim();
  }

  if (command === "ban" || command === "mute") {
    args.duration_minutes = Number(commandExtra.value.trim() || 0);
  }

  return {
    commandName: command,
    args
  };
}

function renderServers(rows) {
  servers.innerHTML = rows
    .map(
      (row) => `
        <div class="server-row">
          <strong>${escapeHtml(row.serverId || "unknown")}</strong>
          <div>Players: ${row.playerCount || 0}</div>
          <div>Place: ${escapeHtml(row.placeId || "-")}</div>
          <div>Updated: ${new Date(row.updatedAt).toLocaleString()}</div>
        </div>
      `
    )
    .join("");
}

function renderLogs(rows) {
  logs.innerHTML = rows
    .map(
      (row) => `
        <div class="log-row">
          <strong>${escapeHtml(row.event)}</strong>
          <div>${escapeHtml(row.message || "-")}</div>
          <div>${escapeHtml(row.category || "-")} · ${new Date(row.createdAt).toLocaleString()}</div>
        </div>
      `
    )
    .join("");
}

function renderRanks(rows) {
  ranks.innerHTML = rows
    .map(
      (row) => `
        <div class="mini-row">
          <strong>${escapeHtml(row.robloxIdentity?.username || "-")}</strong>
          <div>${escapeHtml(row.rank || "-")}</div>
        </div>
      `
    )
    .join("");
}

function renderBans(rows) {
  bans.innerHTML = rows
    .map(
      (row) => `
        <div class="mini-row">
          <strong>${escapeHtml(row.robloxIdentity?.username || "-")}</strong>
          <div>${escapeHtml(row.reason || "-")}</div>
        </div>
      `
    )
    .join("");
}

function attachSocket() {
  if (socket) {
    return;
  }

  socket = io();
  socket.on("log:new", () => loadDashboard());
  socket.on("snapshot:update", () => loadDashboard());
  socket.on("command:result", () => loadDashboard());
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
