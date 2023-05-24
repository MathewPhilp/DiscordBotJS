const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription("Get server information."),
  category: 'utility',
  async execute(interaction) {
    const guild = interaction.guild;
    const guildName = guild.name;
    const guildIcon = guild.iconURL();
    const guildOwner = guild.owner ? guild.owner.user.tag : 'Usophie';
    const guildRegion = guild.region || 'US West';
    const guildMemberCount = guild.memberCount;
    const guildCreatedAt = guild.createdAt.toLocaleDateString();
    const guildVerificationLevel = guild.verificationLevel;
    const guildBoostLevel = guild.premiumTier;

    await interaction.deferReply({ ephemeral: true });

    const clientAvatar = interaction.user.displayAvatarURL();

    const excludedRoles = ['Bot', 'Dyno', 'wowaudit', 'Raid Leader'];
    const includedRoles = ['Administrator', 'Officer', 'Server Booster', 'Raider', 'Trails', 'Community', 'Member', 'New Member'];

    const roleCounts = guild.roles.cache
      .filter(role => includedRoles.includes(role.name) && !excludedRoles.includes(role.name))
      .map(role => ({
        name: role.name,
        memberCount: role.members.size,
      }));

    const exampleEmbed = {
      color: 0xC95CF3,
      title: 'Server Information',
      url: 'https://discord.js.org/',
      author: {
        name: guildName,
        icon_url: guildIcon,
      },
      thumbnail: {
        url: guildIcon,
      },
      fields: [
        { name: 'Owner', value: guildOwner, inline: true },
        { name: 'Region', value: guildRegion, inline: true },
        { name: 'Member Count', value: guildMemberCount, inline: true },
        { name: 'Created At', value: guildCreatedAt, inline: true },
        { name: 'Verification Level', value: guildVerificationLevel, inline: true },
        { name: 'Boost Level', value: guildBoostLevel, inline: true },
      ],
      image: {
        url: 'https://i.imgur.com/MLzpRES.png',
      },
      timestamp: new Date(),
      footer: {
        text: `Requested by ${interaction.user.username}`,
        icon_url: clientAvatar,
      },
    };

    if (roleCounts.length > 0) {
      const roleCountsString = roleCounts
        .sort((a, b) => includedRoles.indexOf(a.name) - includedRoles.indexOf(b.name))
        .map(role => `${role.name}`)
        .join('\n');
      exampleEmbed.fields.push({ name: 'Server Roles', value: roleCountsString });
    }

    await interaction.editReply({ content: 'Retrieving server information... Done!', embeds: [exampleEmbed] });
  },
};
