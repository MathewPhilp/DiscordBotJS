const { SlashCommandBuilder } = require('discord.js');
const config = '../../config.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('summon')
    .setDescription('Move online users with the Raider role to a voice channel.'),
  category: 'moderation',
  async execute(interaction) {
    // Get the target voice channel ID where the users will be moved
    const targetVoiceChannelId = config.raidChannel;

    // Find the Raider role
    await interaction.guild.roles.fetch(); // Update the role cache
    const role = interaction.guild.roles.cache.find((r) => r.name === 'Raider');

    if (!role) {
      return interaction.reply({
        content: 'The Raider role does not exist.',
        ephemeral: true,
      });
    }

    console.log(`Found role: ${role.name}`);
    console.log(`Role members: ${role.members.size}`);

    // Fetch all members to update the member cache
    await interaction.guild.members.fetch();

    // Get all online members with the Raider role
    const membersToMove = role.members.filter(async (member) => {
      if (member.presence) {
        await member.presence.fetch();
        return member.presence.status === 'online';
      }
      return false;
    });

    if (membersToMove.size === 0) {
      return interaction.reply({
        content: 'No online members with the Raider role found.',
        ephemeral: true,
      });
    }

    // Log presence status of individual members
    membersToMove.forEach((member) => {
      console.log(`${member.user.tag} - Presence: ${member.presence?.status}`);
    });

    // Move the members to the target voice channel
    membersToMove.forEach((member) => {
      member.voice.setChannel(targetVoiceChannelId);
    });

    await interaction.reply({
      content: `Moved ${membersToMove.size} online members with the Raider role to the target voice channel.`,
    });
  },
};
