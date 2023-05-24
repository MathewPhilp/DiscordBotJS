const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Deletes a specified number of messages.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete')
        .setRequired(true)),
  category: 'moderation',
  requiredRole: config.officerRoleId,
  async execute(interaction) {
    const officerRole = interaction.guild.roles.cache.get(config.officerRoleId);
    if (!interaction.member.roles.cache.has(officerRole.id)) {
      return interaction.reply({ content: 'This command is restricted to officers only.', ephemeral: true });
    }

    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) {
      return interaction.reply({ content: 'The number of messages to delete must be a positive integer.', ephemeral: true });
    }

    if (amount > 100) {
      return interaction.reply({ content: 'You can only delete up to 100 messages at once.', ephemeral: true });
    }

    try {
      const messages = await interaction.channel.messages.fetch({ limit: 100 });

      if (messages.size === 0) {
        return interaction.reply({ content: 'There are no messages to delete in this channel.', ephemeral: true });
      }

      const messagesArray = Array.from(messages.values());
      const messagesToDelete = messagesArray
        .slice(0, amount)
        .reverse();

      const deletedMessages = await interaction.channel.bulkDelete(messagesToDelete, true);

      return interaction.reply({ content: `Successfully deleted ${deletedMessages.size} messages.`, ephemeral: true });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'Oops! An error occurred while deleting messages.', ephemeral: true });
    }
  },
};
