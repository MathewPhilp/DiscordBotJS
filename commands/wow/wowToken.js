const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.json');
const axios = require('axios');

const CLIENT_ID = config.wowClientID;
const CLIENT_SECRET = config.wowApiKey;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wowtoken')
    .setDescription('Fetches the current NA World of Warcraft token price.'),
    category: 'wow',
  async execute(interaction) {
    try {
      const tokenResponse = await axios.post(
        'https://us.battle.net/oauth/token',
        null,
        {
          params: {
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      const response = await axios.get(
        'https://us.api.blizzard.com/data/wow/token/index',
        {
          params: {
            namespace: 'dynamic-us',
            locale: 'en_US',
            access_token: accessToken,
          },
        }
      );

      const tokenPrice = response.data.price;
      const formattedPrice = (tokenPrice / 10000).toLocaleString();

      await interaction.reply(`(NA) Token Price: ${formattedPrice} 🪙`);
    } catch (error) {
      console.error(error);
      await interaction.reply('Oops! An error occurred while fetching the WoW token price.');
    }
  },
};
