const mysql = require('mysql');
const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.json');

// MySQL connection details
const connectionConfig = {
  host: config.databaseHost,
  port: config.databasePort,
  user: config.databaseUser,
  password: config.databasePassword,
  database: config.databaseDatabase
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('view')
    .setDescription('Retrieve the keystone information for the guild.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('keystones')
        .setDescription('Retrieve the keystone information for the guild.')
        .addStringOption((option) =>
          option.setName('page')
            .setDescription('Page number')
            .setRequired(false)
        )
    ),
  category: 'wow',
  async execute(interaction) {
    // Create MySQL connection
    const connection = mysql.createConnection(connectionConfig);

    connection.connect(error => {
      if (error) {
        console.error('Failed to connect to the MySQL database:', error);
        return interaction.reply('Failed to connect to the MySQL database.');
      }

      console.log('Successfully connected to the MySQL database!');

      // Fetch the keys from the database
      connection.query('SELECT dungeon, key_level, display_name FROM MYTHICPLUSKEYS', (error, results) => {
        if (error) {
          console.error('Failed to execute the database query:', error);
          return interaction.reply('Failed to execute the database query.');
        }

        if (results.length === 0) {
          return interaction.reply('No keys found in the database.');
        }

        const pageSize = 15;
        const pageOption = interaction.options.getString('page');
        const page = pageOption ? parseInt(pageOption) : 1;
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        const totalPages = Math.ceil(results.length / pageSize);

        if (page > totalPages || page < 1 || isNaN(page)) {
          return interaction.reply('Invalid page number.');
        }
        

        const keys = results.slice(startIndex, endIndex);
        const embed = createEmbed(page, totalPages, keys);

        interaction.reply({ embeds: [embed], ephemeral: true});
      });
    });
  }
};

// Helper function to create an embed for a given page
function createEmbed(page, totalPages, keys) {
  const embed = {
    color: 0xC95CF3,
    author: {
        name: 'Keystones for Where Loot',
        icon_url: 'https://wow.zamimg.com/images/wow/icons/large/inv_relics_hourglass.jpg',
      },
    fields: [
      {
        name: '__Dungeon__',
        value: keys.map(key => key.dungeon).join('\n'),
        inline: true
      },
      {
        name: '__Key__',
        value: keys.map(key => `+${key.key_level}`).join('\n'),
        inline: true
      },
      {
        name: '__Name__',
        value: keys.map(key => key.display_name).join('\n'),
        inline: true
      }
    ],
    footer: {
      text: `Use "/view keystones <page number>" to navigate through the list.\n\nPage ${page}/${totalPages}`,
    },
    width: 1000
  };
  return embed;
}


