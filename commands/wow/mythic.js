const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mythicscore')
    .setDescription('Look up a character on World of Warcraft.')
    .addStringOption((option) =>
      option.setName('name').setDescription('The name of the player.').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('realm').setDescription('The realm of the player.').setRequired(true)
    ),
  category: 'wow',
  async execute(interaction) {
    const playerName = interaction.options.getString('name');
    let playerRealm = interaction.options.getString('realm');
    const clientAvatar = interaction.user.displayAvatarURL();

    const capitalizedPlayerName = playerName.charAt(0).toUpperCase() + playerName.slice(1);

    // Convert realm variations to "area-52"
    if (playerRealm.toLowerCase().includes('area')) {
      playerRealm = 'area-52';
    }

    try {
      const gearResponse = await axios.get(
        `https://raider.io/api/v1/characters/profile?region=us&realm=${playerRealm}&name=${playerName}&fields=gear`
      );
      const mythicPlusResponse = await axios.get(
        `https://raider.io/api/v1/characters/profile?region=us&realm=${playerRealm}&name=${playerName}&fields=mythic_plus_scores`
      );
      const mythicPlusBestRunResponse = await axios.get(
        `https://raider.io/api/v1/characters/profile?region=us&realm=${playerRealm}&name=${playerName}&fields=mythic_plus_best_runs`
      );
      const mythicRankResponse = await axios.get(
        `https://raider.io/api/v1/characters/profile?region=us&realm=${playerRealm}&name=${playerName}&fields=mythic_plus_ranks`
      );
      const mythicRecentRunResponse = await axios.get(
        `https://raider.io/api/v1/characters/profile?region=us&realm=${playerRealm}&name=${playerName}&fields=mythic_plus_recent_runs`
      );

      const userData = gearResponse.data;
      const gearData = gearResponse.data.gear;
      const mythicPlusData = mythicPlusResponse.data.mythic_plus_scores;
      const mythicPlusBestRunData = mythicPlusBestRunResponse.data.mythic_plus_best_runs;
      const rankData = mythicRankResponse.data.mythic_plus_ranks;
      const recentRunData = mythicRecentRunResponse.data.mythic_plus_recent_runs;
      



      const rankWorld = rankData['class'].world;
      const rankRegion = rankData['class'].region;
      const rankRealm = rankData['class'].realm;

      const bestRun = mythicPlusBestRunData[0];
      const recentRun = recentRunData[0];

      // Access the properties of the best run
      const bestRunLevel = bestRun.mythic_level;
      const recentRunLevel = recentRun.mythic_level;
      const bestRunDungeon = bestRun.short_name;
      const recentRunDungeon = recentRun.short_name;
      const totalSeconds = bestRun.clear_time_ms / 1000;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const bestRunTimeMinutes = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      // Recent Run


      const recentTotalSeconds = recentRun.clear_time_ms / 1000;
      const recentMinutes = Math.floor(recentTotalSeconds / 60);
      const recentSeconds = Math.floor(recentTotalSeconds % 60);
      const recentRunTimeMinutes = `${recentMinutes}:${recentSeconds.toString().padStart(2, '0')}`;

      const userClass = userData.class;
      let userRole = userData.active_spec_role;
      // Modify role capitalization
      if (userRole === 'HEALING') {
        userRole = 'Healing';
      } else if (userRole === 'TANK') {
        userRole = 'Tank';
      }

      const raiderIoLink = `https://raider.io/characters/us/${playerRealm}/${playerName}`;

      const gearEmbed = {
        color: 0xC95CF3,
        title: `${userData.name} - ${userData.realm} | ${gearData.item_level_equipped} ${userData.active_spec_name} ${userClass}`,
        url: userData.profile_url,
        description: ``,
        thumbnail: {
          url: userData.thumbnail_url,
        },
        fields: [
          { name: '__Mythic+ Score__', value: `${mythicPlusData.all}`, inline: false },
          {
            name: '__Best Mythic + Dungeon Run__',
            value: `+${bestRunLevel} - ${bestRunDungeon} - ${bestRunTimeMinutes} minutes`,
            inline: true,
          },
          {
            name: '__Recent Mythic + Dungeon Run__',
            value: `+${recentRunLevel} - ${recentRunDungeon} - ${recentRunTimeMinutes} minutes`,
            inline: false,
          },
          {
            name: '__M+ Class Rank__',
            value: `**World:** ${rankWorld}\n**Region:** ${rankRegion}\n**Realm:** ${rankRealm}\n`,
            inline: false,
          },
          {
            name: '__Profile Link__',
            value: `[RaiderIO](${raiderIoLink})`,
          },
        ],
        timestamp: new Date(),
        footer: {
          text: `Requested by ${interaction.user.username}`,
          icon_url: clientAvatar,
        },
      };

      await interaction.reply({ embeds: [gearEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('An error occurred while looking up the player.');
    }
  },
};
