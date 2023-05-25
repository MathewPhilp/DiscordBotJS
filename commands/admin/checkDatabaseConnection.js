const mysql = require('mysql');
const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.json');


// MySQL connection details
const connectionConfig = {
  host: config.databaseHost,
  port: config.databasePort,
  user: config.databaseUser,
  password: config.databasePassword
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkdatabaseconnection')
    .setDescription('Checks the MySQL database connection.')
    .setDefaultMemberPermissions('0')
    .setDMPermission(false),
    category: 'admin',

  async execute(interaction) {
    const connection = mysql.createConnection(connectionConfig);

    connection.connect((error) => {
      if (error) {
        console.error('Failed to connect to the MySQL database:', error);
        return interaction.reply('Failed to connect to the MySQL database.');
      }

      console.log('Successfully connected to the MySQL database!');
      interaction.reply('Successfully connected to the MySQL database.');
      connection.end(); // Close the connection
    });
  },
};
