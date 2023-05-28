const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nasa')
    .setDescription('Get NASA Astronomy Picture of the Day'),
  async execute(interaction) {
    try {
      const response = await axios.get('https://api.nasa.gov/planetary/apod', {
        params: {
          api_key: 'TXYxjwZBlhpzIwMYflm4NlH2XUsJjt3WLROg0AhV',
        },
      });

      const fact = response.data.explanation;
      const imageUrl = response.data.url;
      const title = response.data.title;

      const exampleEmbed = {
        color: 0xC95CF3,
        title: 'Astronomy Picture of the Day',
        description: 'Check out this random space fact!',
        thumbnail: {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/2449px-NASA_logo.svg.png',
        },
        fields: [
          { name: '__Title__', value: title },
          { name: '__Information__', value: fact },
        ],
        image: {
          url: imageUrl,
        },
        timestamp: new Date(),
        footer: {
          text: `Requested by ${interaction.user.username}`,
          icon_url: interaction.user.displayAvatarURL(),
        },
      };

      await interaction.reply({ embeds: [exampleEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('Oops! An error occurred while Astronomy Picture of the Day.');
    }
  },
};
