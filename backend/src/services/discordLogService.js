const webhookMapByCategory = {
  ban: "DISCORD_WEBHOOK_BAN_LOGS",
  admin: "DISCORD_WEBHOOK_ADMIN_LOGS",
  chat: "DISCORD_WEBHOOK_CHAT_LOGS",
  exploit: "DISCORD_WEBHOOK_EXPLOIT_LOGS",
  join: "DISCORD_WEBHOOK_JOIN_LOGS",
  system: "DISCORD_WEBHOOK_SYSTEM_LOGS"
};

class DiscordLogService {
  constructor(env) {
    this.env = env;
  }

  async send(category, title, description, fields = []) {
    const envKey = webhookMapByCategory[category] || "DISCORD_WEBHOOK_SYSTEM_LOGS";
    const url = this.env[envKey];
    if (!url) {
      return;
    }

    const body = {
      username: "Roblox Admin Suite",
      embeds: [
        {
          title,
          description,
          color: colorForCategory(category),
          fields: fields
            .filter((field) => field && field.name)
            .slice(0, 10)
            .map((field) => ({
              name: String(field.name).slice(0, 256),
              value: String(field.value || "-").slice(0, 1024),
              inline: Boolean(field.inline)
            })),
          timestamp: new Date().toISOString()
        }
      ]
    };

    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    }).catch(() => null);
  }
}

function colorForCategory(category) {
  const colors = {
    ban: 0xdb4437,
    admin: 0x2563eb,
    chat: 0x7c3aed,
    exploit: 0xf59e0b,
    join: 0x10b981,
    system: 0x64748b
  };
  return colors[category] || colors.system;
}

module.exports = DiscordLogService;
