const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');

const CLIENT_ID = config.wowClientID;
const CLIENT_SECRET = config.wowApiKey;

async function checkRealmStatus(realmId, accessToken) {
  try {
    const response = await axios.get(`https://us.api.blizzard.com/data/wow/connected-realm/${realmId}?namespace=dynamic-us&locale=en_US&access_token=${accessToken}`);
    const realmStatus = response.data.status.type;

    if (realmStatus === 'UP') {
      return 'Online';
    } else {
      return 'Offline';
    }
  } catch (error) {
    console.error('An error occurred while checking realm status:', error);
    return 'Unknown';
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('realmstatus')
    .setDescription('Check the status of a WoW realm.')
    .setDefaultPermission(true),
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

      const realmStatus = await checkRealmStatus(3676, accessToken);
      await interaction.reply(`Realm Area52 is ${realmStatus}.`);
    } catch (error) {
      console.error(error);
      await interaction.reply('An error occurred while checking the realm status.');
    }
  },
};
