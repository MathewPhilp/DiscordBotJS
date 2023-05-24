const axios = require('axios');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lookup')
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
      const raidProgResponse = await axios.get(
        `https://raider.io/api/v1/characters/profile?region=us&realm=${playerRealm}&name=${playerName}&fields=raid_progression`
      );

      const userData = gearResponse.data;
      const gearData = gearResponse.data.gear;
      const mythicPlusData = mythicPlusResponse.data.mythic_plus_scores;
      const mythicPlusBestRunData = mythicPlusBestRunResponse.data.mythic_plus_best_runs;
      const raidData = raidProgResponse.data.raid_progression;

      const aberrusSummary = raidData['aberrus-the-shadowed-crucible'].summary;
      const lastTierSummary = raidData['vault-of-the-incarnates'].summary;

      const bestRun = mythicPlusBestRunData[0];

      // Access the properties of the best run
      const bestRunLevel = bestRun.mythic_level;
      const bestRunDungeon = bestRun.short_name;
      const totalSeconds = bestRun.clear_time_ms / 1000;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const bestRunTimeMinutes = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      const userRace = userData.race;
      const userClass = userData.class;
      const userSpec = userData.active_spec_name;
      let userRole = userData.active_spec_role;
      const userFaction = userData.faction;
      const userAPoints = userData.achievement_points;

      // Modify role capitalization
      if (userRole === 'HEALING') {
        userRole = 'Healing';
      } else if (userRole === 'TANK') {
        userRole = 'Tank';
      }

      const wowArmoryLink = `https://worldofwarcraft.com/en-us/character/us/${playerRealm}/${capitalizedPlayerName}`;
      const warcraftLogsLink = `https://www.warcraftlogs.com/character/us/${playerRealm}/${playerName}`;
      const raiderIoLink = `https://raider.io/characters/us/${playerRealm}/${playerName}`;
      const wowProgressLink = `https://www.wowprogress.com/character/us/${playerRealm}/${playerName}`;

      const gearEmbed = {
        color: 0xC95CF3,
        title: `${userData.name} - ${userData.realm} | ${gearData.item_level_equipped} ${userData.active_spec_name} ${userClass}`,
        url: userData.profile_url,
        description: ``,
        thumbnail: {
          url: userData.thumbnail_url,
        },
        fields: [
          {
            name: '__Recent Raid Progression__',
            value: `**ATSC:** ${aberrusSummary}\n**VOTI:** ${lastTierSummary}`,
            inline: false,
          },
          { name: '__Mythic+ Score__', value: `${mythicPlusData.all}`, inline: true },
          {
            name: '__Best M+ Dungeon__',
            value: `+${bestRunLevel} - ${bestRunDungeon} - ${bestRunTimeMinutes} minutes`,
            inline: true,
          },
          {
            name: '__Additional Information__',
            value: `**Race:** ${userRace}\n**Class:** ${userClass}\n**Spec:** ${userSpec}\n**Role:** ${userRole}\n**Faction:** ${userFaction}`,
          },
          {
            name: 'Useful Links',
            value: `[WoWArmory](${wowArmoryLink}) | [RaiderIO](${raiderIoLink}) | [WoWProgress](${wowProgressLink}) | [Warcraft Logs](${warcraftLogsLink}) `,
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
