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
    .setName('set')
    .setDescription('Set the dungeon and key for the user.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('keystone')
        .setDescription('Set the dungeon and key for the user.')
        .addStringOption((option) =>
          option.setName('dungeon')
            .setDescription('Please specify the dungeon')
            .setRequired(true)
            .addChoices(
              { name: 'Brackenhide Hallow', value: 'Brackenhide Hallow' },
              { name: 'Freehold', value: 'Freehold' },
              { name: 'Halls of Infusion', value: 'Halls of Infusion' },
              { name: 'Neltharions Lair', value: 'Neltharions Lair' },
              { name: 'Neltharus', value: 'Neltharus' },
              { name: 'The Underrot', value: 'The Underrot' },
              { name: 'The Vortex Pinnacle', value: 'The Vortex Pinnacle' },
              { name: 'Uldaman: Legacy of Tyr', value: 'Uldaman: Legacy of Tyr' }
            )
        )
        .addStringOption((option) =>
          option.setName('key')
            .setDescription('Please specify the level of your Mythic+ key.')
            .setRequired(true)
        )
    ),
  category: 'wow',
  async execute(interaction) {
    const userId = interaction.user.id;
    const dungeon = interaction.options.getString('dungeon');
    const key = interaction.options.getString('key');
    const displayname = interaction.member.displayName;

    if (!/^\d{1,2}$/.test(key)) {
      return interaction.reply('Invalid key input. Please enter a number with a maximum of two characters for the key input.');
    }

    // Create MySQL connection
    const connection = mysql.createConnection(connectionConfig);

    connection.connect(error => {
      if (error) {
        console.error('Failed to connect to the MySQL database:', error);
        return interaction.reply('Failed to connect to the MySQL database.');
      }

      console.log('Successfully connected to the MySQL database!');

      // Check if the user exists in the database
      connection.query(
        `SELECT * FROM MYTHICPLUSKEYS WHERE id='${userId}'`,
        (error, results) => {
          if (error) {
            console.error('Failed to execute the database query:', error);
            return interaction.reply('Failed to execute the database query.');
          }

          if (results.length === 0) {
            // User doesn't exist, create a new row
            connection.query(
              `INSERT INTO MYTHICPLUSKEYS (id, dungeon, key_level, display_name) VALUES ('${userId}', '${dungeon}', '${key}', '${displayname}');`,
              error => {
                if (error) {
                  console.error('Failed to insert data into the database:', error);
                  return interaction.reply('Failed to insert data into the database.');
                }

                interaction.reply({ content: 'The Mythic+ data has been successfully set.', ephemeral: true });

              }
            );
          } else {
            // User exists, update the existing row
            connection.query(
              `UPDATE MYTHICPLUSKEYS SET dungeon = '${dungeon}', key_level = '${key}', display_name = '${displayname}'  WHERE id = '${userId}';`,
              error => {
                if (error) {
                  console.error('Failed to update data in the database:', error);
                  return interaction.reply('Failed to update data in the database.');
                }
                connection.end(); // Close the MySQL connection
                interaction.reply({ content: 'The Mythic+ data has been successfully updated.', ephemeral: true });
              }
            );
          }
        }
      );
    });
  }
};
