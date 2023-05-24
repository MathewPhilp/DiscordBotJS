const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all bot commands')
    .addStringOption((option) =>
      option.setName('page')
        .setDescription('Page number')
        .setRequired(false)
    ),
  category: 'utility',
  async execute(interaction) {
    const commands = interaction.client.commands;
    const pageSize = 10;
    const pageOption = interaction.options.getString('page');
    const page = pageOption ? parseInt(pageOption) : 1;
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const totalPages = Math.ceil(commands.size / pageSize);

    if (page > totalPages || page < 1 || isNaN(page)) {
      return interaction.reply('Invalid page number.');
    }

    const commandList = [...commands.values()].slice(startIndex, endIndex);

    const embed = {
      color: 0xC95CF3,
      title: 'Bot Commands',
      description: `Page ${page}/${totalPages}`,
      fields: commandList.map((command) => ({
        name: `/${command.data.name}`,
        value: command.data.description,
      })),
      footer: {
        text: `Use "/help <page number>" to navigate through the command list.`,
      },
    };

    await interaction.reply({ embeds: [embed] });
  },
};
