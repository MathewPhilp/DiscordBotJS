const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

let cachedQuote = null; // Cache the quote
let lastUpdated = null; // Last time the quote was updated

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Fetches the quote of the day.'),
    category: 'fun',
  async execute(interaction) {
    // Check if the user has the "Officer" role by role ID
		const officerRoleId = '1053766070500085830';
		const member = interaction.member;
		const hasOfficerRole = member.roles.cache.has(officerRoleId);

		if (!hasOfficerRole) {
			return interaction.reply('Only officers can use this command.');
		}
    await interaction.deferReply(); // Defer the reply

    const now = new Date();
    const currentDay = now.getUTCDate();
    const currentHour = now.getUTCHours();

    // Check if the quote needs to be updated
    if (
      lastUpdated === null ||
      lastUpdated.getUTCDate() !== currentDay ||
      (currentHour >= 6 && lastUpdated.getUTCHours() < 6)
    ) {
      try {
        const response = await axios.get('https://favqs.com/api/qotd');
        const quote = response.data.quote.body;
        const author = response.data.quote.author;
        cachedQuote = `${quote}\n\n- ${author}`;
        lastUpdated = now;
      } catch (error) {
        console.error(error);
        await interaction.editReply('An error occurred while fetching the quote.');
        return;
      }
    }

    await interaction.editReply(`Quote of the Day:\n\n${cachedQuote}`);
  },
};
