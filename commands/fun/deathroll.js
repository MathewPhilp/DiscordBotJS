const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports =
{
  data: new SlashCommandBuilder()
  .setName('deathroll')
  .setDescription('Replies with your input!')
  .addNumberOption(option =>
		option
      .setName('input')
			.setDescription('The input to echo back')
			.setRequired(true))
      .setDefaultMemberPermissions('1')
      .setDMPermission(true),
      category: 'fun',
  async execute(interaction)
  {
    let input = interaction.options.getNumber('input');

    function randomInt(input)
    {
      return Math.floor(Math.random() * (input - 1 + 1) + 1);
    }

    let test = randomInt(input);

    if (test == 1)
    {
      await interaction.reply(`**Your Lose!**\n0-${test}`)

    }
    else
    {
      await interaction.reply(`0-${test}`);
    }


  },
}