const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get information about the server.'),
  category: 'utility',
  async execute(interaction) {
    const guild = interaction.guild;
    await guild.members.fetch();
    const owner = guild.members.cache.get(guild.ownerId);

    const textChannels = guild.channels.cache.filter(c => c.type === 0);
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2);
    const roleList = guild.roles.cache
    .sort((a, b) => b.position - a.position) // Sort roles by position in descending order
    .map(role => role.name)
    .join(', ');
    const members = guild.memberCount;
    const roles = guild.roles.cache.size;
    const serverId = guild.id;
    const serverCreationDate = guild.createdAt.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    const botAvatar = interaction.client.user.displayAvatarURL();

    const exampleEmbed = {
      color: 0xC95CF3,
      url: 'https://discord.js.org/',
      author: {
        name: 'Where Loot',
        icon_url: botAvatar,
        url: 'https://discord.js.org',
      },
      thumbnail: {
        url: botAvatar,
      },
      fields: [
        { name: 'Owner', value: owner.user.tag, inline: true },
        { name: 'Category Channels', value: '7', inline: true },
        { name: 'Text Channels', value: textChannels.size, inline: true },
        { name: 'Voice Channels', value: voiceChannels.size, inline: true },
        { name: 'Members', value: members, inline: true },
        { name: 'Roles', value: roles, inline: true },
        { name: 'Role List', value: roleList, inline: false },
      ],
      footer: {
        text: `ID: ${serverId} | Server Created • ${serverCreationDate}`,
      },
    };

    await interaction.reply({ embeds: [exampleEmbed] });
  },
};
