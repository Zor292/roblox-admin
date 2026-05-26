const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const schema = z.object({
  NODE_ENV: z.string().default("production"),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().min(1),
  API_SHARED_SECRET: z.string().min(12),
  COMMAND_TIMEOUT_MS: z.coerce.number().default(15000),
  DISCORD_BOT_TOKEN: z.string().optional().default(""),
  DISCORD_CLIENT_ID: z.string().optional().default(""),
  DISCORD_GUILD_ID: z.string().optional().default(""),
  DISCORD_OWNER_IDS: z.string().optional().default(""),
  DISCORD_DEVELOPER_IDS: z.string().optional().default(""),
  DISCORD_HEAD_ADMIN_ROLE_IDS: z.string().optional().default(""),
  DISCORD_ADMIN_ROLE_IDS: z.string().optional().default(""),
  DISCORD_MODERATOR_ROLE_IDS: z.string().optional().default(""),
  DISCORD_SUPPORT_ROLE_IDS: z.string().optional().default(""),
  DASHBOARD_USERNAME: z.string().min(1),
  DASHBOARD_PASSWORD: z.string().min(1),
  DASHBOARD_JWT_SECRET: z.string().min(12),
  DISCORD_WEBHOOK_BAN_LOGS: z.string().optional().default(""),
  DISCORD_WEBHOOK_ADMIN_LOGS: z.string().optional().default(""),
  DISCORD_WEBHOOK_CHAT_LOGS: z.string().optional().default(""),
  DISCORD_WEBHOOK_EXPLOIT_LOGS: z.string().optional().default(""),
  DISCORD_WEBHOOK_JOIN_LOGS: z.string().optional().default(""),
  DISCORD_WEBHOOK_SYSTEM_LOGS: z.string().optional().default("")
});

const env = schema.parse(process.env);

env.idLists = {
  ownerIds: splitIds(env.DISCORD_OWNER_IDS),
  developerIds: splitIds(env.DISCORD_DEVELOPER_IDS),
  headAdminRoleIds: splitIds(env.DISCORD_HEAD_ADMIN_ROLE_IDS),
  adminRoleIds: splitIds(env.DISCORD_ADMIN_ROLE_IDS),
  moderatorRoleIds: splitIds(env.DISCORD_MODERATOR_ROLE_IDS),
  supportRoleIds: splitIds(env.DISCORD_SUPPORT_ROLE_IDS)
};

module.exports = env;

function splitIds(value) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}
