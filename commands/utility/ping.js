const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Get the bot's ping and latency."),
  category: 'utility',
  async execute(interaction) {
    const startTime = Date.now();
    await interaction.deferReply({ ephemeral: true }); // Defer the reply as ephemeral
    const botLatency = interaction.client.ws.ping;
    const endTime = Date.now();
    const ping = endTime - startTime;

    const clientAvatar = interaction.user.displayAvatarURL(); // Retrieve the user's profile picture URL
    const botAvatar = interaction.client.user.displayAvatarURL();

    const exampleEmbed = {
      color: 0xC95CF3,
      title: 'Server Latency Checker',
      url: 'https://discord.js.org/',
      author: {
        name: 'Performance',
        icon_url: botAvatar, // Use the user's profile picture URL as the icon_url
        url: 'https://discord.js.org',
      },
      description: 'Check the ping and latency of the bot in the server.',
      thumbnail: {
        url: clientAvatar, // Use the user's profile picture URL as the thumbnail URL
      },
      fields: [
        { name: 'Ping', value: `${ping}ms`, inline: true },
        { name: 'Bot Latency', value: `${botLatency}ms`, inline: true },
      ],
      image: {
        url: 'https://i.imgur.com/MLzpRES.png',
      },
      timestamp: new Date(),
      footer: {
        text: `Created by ${interaction.user.username}`, // Add the user's name to the footer text
        icon_url: clientAvatar, // Use the user's profile picture URL as the footer icon_url
      },
    };

    await interaction.editReply({ content: 'Pinging... Done!', embeds: [exampleEmbed] });
  },
};
