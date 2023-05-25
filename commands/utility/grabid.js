const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getid')
    .setDescription('Get your user ID.'),
    category: 'utility',
  async execute(interaction) {
    const userId = interaction.user.id;

    await interaction.reply({ content: `Your user ID is: ${userId}`, ephemeral: true });
  },
};