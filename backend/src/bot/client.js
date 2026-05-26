const { Client, Events, GatewayIntentBits, REST, Routes } = require("discord.js");
const buildSlashCommands = require("./commands/buildSlashCommands");
const { getCommand } = require("../shared/commandCatalog");

function normalizeOptions(interaction, command) {
  const args = {};
  for (const option of command.options) {
    const getterMap = {
      string: "getString",
      integer: "getInteger",
      boolean: "getBoolean",
      number: "getNumber"
    };
    const method = getterMap[option.type];
    args[option.name] = interaction.options[method](option.name);
  }
  return args;
}

async function startDiscordBot({ env, commandBus, permissionService }) {
  if (!env.DISCORD_BOT_TOKEN || !env.DISCORD_CLIENT_ID || !env.DISCORD_GUILD_ID) {
    return null;
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds]
  });

  client.once(Events.ClientReady, async () => {
    const rest = new REST({ version: "10" }).setToken(env.DISCORD_BOT_TOKEN);
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID), {
      body: buildSlashCommands()
    });
    process.stdout.write(`Discord bot ready as ${client.user.tag}\n`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = getCommand(interaction.commandName);
    if (!command) {
      return;
    }

    if (!permissionService.canUse(interaction.member, interaction.commandName)) {
      await interaction.reply({
        ephemeral: true,
        content: "You do not have permission to use this command."
      });
      return;
    }

    const actorRank = permissionService.resolveDiscordRank(interaction.member);
    const args = normalizeOptions(interaction, command);

    await interaction.deferReply({ ephemeral: false });

    const queued = await commandBus.queueCommand({
      commandName: interaction.commandName,
      args,
      actor: {
        id: interaction.user.id,
        tag: interaction.user.tag,
        rank: actorRank.rank
      },
      source: "discord",
      scope: {}
    });

    try {
      const result = await commandBus.waitForResult(queued.nonce);
      await interaction.editReply(formatDiscordResponse(result));
    } catch (error) {
      await interaction.editReply(`Queued as \`${queued.nonce}\` and waiting for Roblox. ${error.message}`);
    }
  });

  await client.login(env.DISCORD_BOT_TOKEN);
  return client;
}

function formatDiscordResponse(result) {
  const ok = result?.result?.ok !== false;
  const message = result?.result?.message || "No message returned from Roblox.";
  const lines = [
    `Status: ${ok ? "success" : "failed"}`,
    `Command: ${result?.commandName || "-"}`,
    `Target: ${result?.target?.username || "-"}`,
    `Message: ${message}`
  ];

  if (result?.result?.data) {
    lines.push("Data:");
    lines.push("```json");
    lines.push(JSON.stringify(result.result.data, null, 2).slice(0, 1800));
    lines.push("```");
  }

  return lines.join("\n");
}

module.exports = startDiscordBot;
