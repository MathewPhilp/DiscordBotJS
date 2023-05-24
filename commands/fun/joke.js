const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Tells a World of Warcraft-themed joke or pun.'),
    category: 'fun',
  async execute(interaction) {
    try {
      const response = await axios.get('https://icanhazdadjoke.com/', {
        headers: {
          Accept: 'application/json',
        },
      });

      const joke = response.data.joke;

      await interaction.reply(joke);
    } catch (error) {
      console.error(error);
      await interaction.reply('Oops! An error occurred while fetching the joke.');
    }
  },
};
