const catalog = [
  {
    name: "ban",
    description: "Ban a player from Roblox",
    requiredRank: "Head Admin",
    category: "moderation",
    options: [
      { name: "player", description: "Target username", type: "string", required: true },
      { name: "reason", description: "Ban reason", type: "string", required: true },
      { name: "duration_minutes", description: "Duration in minutes, 0 = permanent", type: "integer", required: false }
    ]
  },
  {
    name: "kick",
    description: "Kick a player from the server",
    requiredRank: "Moderator",
    category: "moderation",
    options: [
      { name: "player", description: "Target username", type: "string", required: true },
      { name: "reason", description: "Kick reason", type: "string", required: true }
    ]
  },
  {
    name: "warn",
    description: "Warn a player",
    requiredRank: "Moderator",
    category: "moderation",
    options: [
      { name: "player", description: "Target username", type: "string", required: true },
      { name: "reason", description: "Warning reason", type: "string", required: true }
    ]
  },
  {
    name: "mute",
    description: "Mute a player",
    requiredRank: "Moderator",
    category: "moderation",
    options: [
      { name: "player", description: "Target username", type: "string", required: true },
      { name: "reason", description: "Mute reason", type: "string", required: true },
      { name: "duration_minutes", description: "Duration in minutes", type: "integer", required: false }
    ]
  },
  {
    name: "unban",
    description: "Remove a player ban",
    requiredRank: "Head Admin",
    category: "moderation",
    options: [
      { name: "player", description: "Target username", type: "string", required: true },
      { name: "reason", description: "Reason for unban", type: "string", required: false }
    ]
  },
  {
    name: "freeze",
    description: "Freeze or unfreeze a player",
    requiredRank: "Admin",
    category: "moderation",
    options: [
      { name: "player", description: "Target username", type: "string", required: true },
      { name: "enabled", description: "Enable freeze", type: "boolean", required: true },
      { name: "reason", description: "Reason", type: "string", required: false }
    ]
  },
  {
    name: "bring",
    description: "Bring a player to you",
    requiredRank: "Admin",
    category: "moderation",
    options: [
      { name: "player", description: "Target username", type: "string", required: true }
    ]
  },
  {
    name: "goto",
    description: "Teleport to a player",
    requiredRank: "Admin",
    category: "moderation",
    options: [
      { name: "player", description: "Target username", type: "string", required: true }
    ]
  },
  {
    name: "spectate",
    description: "Spectate a player",
    requiredRank: "Support",
    category: "monitoring",
    options: [
      { name: "player", description: "Target username", type: "string", required: true }
    ]
  },
  {
    name: "announce",
    description: "Send an in-game announcement",
    requiredRank: "Admin",
    category: "moderation",
    options: [
      { name: "message", description: "Announcement message", type: "string", required: true }
    ]
  },
  {
    name: "shutdown",
    description: "Shutdown the Roblox server",
    requiredRank: "Head Admin",
    category: "advanced",
    options: [
      { name: "reason", description: "Shutdown reason", type: "string", required: false }
    ]
  },
  {
    name: "serverlock",
    description: "Toggle server lock",
    requiredRank: "Head Admin",
    category: "advanced",
    options: [
      { name: "enabled", description: "Lock state", type: "boolean", required: true },
      { name: "reason", description: "Reason", type: "string", required: false }
    ]
  },
  {
    name: "playerinfo",
    description: "Get player information",
    requiredRank: "Support",
    category: "monitoring",
    options: [
      { name: "player", description: "Target username", type: "string", required: true }
    ]
  },
  {
    name: "logs",
    description: "Read latest logs",
    requiredRank: "Support",
    category: "monitoring",
    options: [
      {
        name: "category",
        description: "Log category",
        type: "string",
        required: false,
        choices: ["admin", "ban", "chat", "exploit", "join", "system"]
      }
    ]
  },
  {
    name: "inventory",
    description: "Inspect player inventory data",
    requiredRank: "Support",
    category: "monitoring",
    options: [
      { name: "player", description: "Target username", type: "string", required: true }
    ]
  },
  {
    name: "job",
    description: "Inspect player roleplay job data",
    requiredRank: "Support",
    category: "monitoring",
    options: [
      { name: "player", description: "Target username", type: "string", required: true }
    ]
  },
  {
    name: "money",
    description: "Inspect player money data",
    requiredRank: "Support",
    category: "monitoring",
    options: [
      { name: "player", description: "Target username", type: "string", required: true }
    ]
  },
  {
    name: "alts",
    description: "Inspect alt-account hints",
    requiredRank: "Admin",
    category: "monitoring",
    options: [
      { name: "player", description: "Target username", type: "string", required: true }
    ]
  },
  {
    name: "session",
    description: "Inspect current session data",
    requiredRank: "Support",
    category: "monitoring",
    options: [
      { name: "player", description: "Target username", type: "string", required: true }
    ]
  },
  {
    name: "revive",
    description: "Respawn a player",
    requiredRank: "Admin",
    category: "advanced",
    options: [
      { name: "player", description: "Target username", type: "string", required: true }
    ]
  },
  {
    name: "heal",
    description: "Heal a player",
    requiredRank: "Moderator",
    category: "advanced",
    options: [
      { name: "player", description: "Target username", type: "string", required: true }
    ]
  },
  {
    name: "setrank",
    description: "Update a Roblox admin rank",
    requiredRank: "Owner",
    category: "advanced",
    options: [
      { name: "player", description: "Target username", type: "string", required: true },
      {
        name: "rank",
        description: "Rank name",
        type: "string",
        required: true,
        choices: ["Owner", "Developer", "Head Admin", "Admin", "Moderator", "Support"]
      }
    ]
  },
  {
    name: "setteam",
    description: "Move player to a team",
    requiredRank: "Admin",
    category: "advanced",
    options: [
      { name: "player", description: "Target username", type: "string", required: true },
      { name: "team", description: "Team name", type: "string", required: true }
    ]
  },
  {
    name: "tpcoords",
    description: "Teleport player to coordinates",
    requiredRank: "Head Admin",
    category: "advanced",
    options: [
      { name: "player", description: "Target username", type: "string", required: true },
      { name: "x", description: "X coordinate", type: "number", required: true },
      { name: "y", description: "Y coordinate", type: "number", required: true },
      { name: "z", description: "Z coordinate", type: "number", required: true }
    ]
  },
  {
    name: "vehicle",
    description: "Run a vehicle adapter action",
    requiredRank: "Developer",
    category: "advanced",
    options: [
      { name: "player", description: "Target username", type: "string", required: true },
      { name: "model", description: "Vehicle model name", type: "string", required: true }
    ]
  },
  {
    name: "clearitems",
    description: "Clear tools and backpack items",
    requiredRank: "Admin",
    category: "advanced",
    options: [
      { name: "player", description: "Target username", type: "string", required: true }
    ]
  }
];

const rankPower = {
  Support: 10,
  Moderator: 20,
  Admin: 30,
  "Head Admin": 40,
  Developer: 50,
  Owner: 60
};

module.exports = {
  catalog,
  rankPower,
  getCommand(name) {
    return catalog.find((entry) => entry.name === name);
  }
};
