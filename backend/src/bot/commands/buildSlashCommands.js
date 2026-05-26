const { SlashCommandBuilder } = require("discord.js");
const { catalog } = require("../../shared/commandCatalog");

function buildSlashCommands() {
  return catalog.map((command) => {
    const builder = new SlashCommandBuilder().setName(command.name).setDescription(command.description);

    for (const option of command.options) {
      addOption(builder, option);
    }

    return builder.toJSON();
  });
}

function addOption(builder, option) {
  const applyChoices = (target) => {
    if (Array.isArray(option.choices)) {
      for (const choice of option.choices) {
        target.addChoices({ name: choice, value: choice });
      }
    }
    return target;
  };

  if (option.type === "string") {
    builder.addStringOption((target) =>
      applyChoices(
        target
        .setName(option.name)
        .setDescription(option.description)
        .setRequired(Boolean(option.required))
      )
    );
    return;
  }

  if (option.type === "integer") {
    builder.addIntegerOption((target) =>
      target
        .setName(option.name)
        .setDescription(option.description)
        .setRequired(Boolean(option.required))
    );
    return;
  }

  if (option.type === "boolean") {
    builder.addBooleanOption((target) =>
      target
        .setName(option.name)
        .setDescription(option.description)
        .setRequired(Boolean(option.required))
    );
    return;
  }

  if (option.type === "number") {
    builder.addNumberOption((target) =>
      target
        .setName(option.name)
        .setDescription(option.description)
        .setRequired(Boolean(option.required))
    );
  }
}

module.exports = buildSlashCommands;
