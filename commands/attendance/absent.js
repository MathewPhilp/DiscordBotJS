const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('absent')
    .setDescription('Notify about an absence')
    .addStringOption((option) =>
      option.setName('activity')
        .setDescription('Specify the activity you will be absent from')
        .setRequired(true)
        .addChoices(
          { name: 'Raid', value: 'Raid' },
          { name: 'Mythic+', value: 'Mythic+' },
        )
    )
    .addStringOption((option) =>
      option.setName('date')
        .setDescription('Date(s) of absence (separate multiple dates with commas or use a dash for longer stretches)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason')
        .setDescription('Reason for absence')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('character_name')
        .setDescription('Character Name (if different from Discord)')
        .setRequired(false)
    ),
      category: 'attendance',
      async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
    
        const activity = interaction.options.getString('activity');
        const date = interaction.options.getString('date');
        const reason = interaction.options.getString('reason');
        const characterName = interaction.options.getString('character_name') || interaction.member.displayName;
    
        const channelID = config.absentChannelId;
        const threadID = config.absentThreadId;
    
        const channel = await interaction.client.channels.fetch(channelID);
        const thread = await channel.threads.fetch(threadID);
    
        const exampleEmbed = {
          color: 0xC95CF3,
          title: 'Absent Notification',
          timestamp: new Date(),
          footer: {
            text: `Submitted by ${interaction.member.displayName}`,
            icon_url: interaction.user.displayAvatarURL(),
          },
          fields: [
            {
              name: 'Character Name',
              value: characterName,
              inline: false,
            },
            {
              name: 'Activity',
              value: activity,
              inline: false,
            },
            {
              name: 'Date(s)',
              value: date,
              inline: false,
            },
            {
              name: 'Reason',
              value: reason,
              inline: false,
            },
          ],
        };
    
        await thread.send({ embeds: [exampleEmbed] });
        await interaction.editReply({ content: 'Your absence has been notified. Thank you!' });
      },
    };
    
