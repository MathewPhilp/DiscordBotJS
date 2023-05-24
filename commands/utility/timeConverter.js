const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeconverter')
    .setDescription('Convert the current time or specified time to different time zones.')
    .addStringOption((option) =>
      option
        .setName('input_time')
        .setDescription('The time to convert (e.g., 5pm or 5:00pm). Leave empty to use the current time.')
        .setRequired(false)
    ),
  category: 'utility',
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const inputTime = interaction.options.getString('input_time');
    const currentTime = inputTime ? parseTime(inputTime) : getCurrentTime();
    const currentDate = getCurrentDate();

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const targetTimeZones = [
      { name: 'Eastern Time (EST)', offset: -4 },
      { name: 'Central Time (CST)', offset: -5 },
      { name: 'Mountain Time (MST)', offset: -6 },
      { name: 'Pacific Time (PST)', offset: -7 },
    ];

    const convertedTimes = targetTimeZones.map((targetTimeZone) => {
      const convertedTime = convertTime(currentTime, userTimeZone, targetTimeZone.offset);
      return { name: targetTimeZone.name, value: convertedTime };
    });
    
    const exampleEmbed = {
      color: 0xC95CF3,
      title: 'Time Conversion',
      description: `The converted times for ${inputTime ? `the specified time (${inputTime})` : `the current time (${formatTime(currentTime)}) on ${currentDate}`} are:`,
      fields: convertedTimes,
      timestamp: new Date(),
      footer: {
        text: `Requested by ${interaction.user.username}`,
        icon_url: interaction.user.displayAvatarURL(),
      },
    };

    exampleEmbed.fields.push({ name: 'Your Time Zone', value: userTimeZone });

    await interaction.editReply({ content: 'Converting time... Done!', embeds: [exampleEmbed] });
  },
};

// Rest of the code remains the same







function parseTime(time) {
  const regex = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i;
  const match = regex.exec(time.trim());
  if (match) {
    let hour = parseInt(match[1]);
    const minute = match[2] ? parseInt(match[2]) : 0;
    const isPM = /pm/i.test(match[3]);
    if (hour === 12 && !isPM) {
      hour = 0;
    } else if (hour !== 12 && isPM) {
      hour += 12;
    }
    return { hour, minute };
  }
  throw new Error('Invalid time format. Please provide a time in the format HH:mm or HH:mm AM/PM.');
}

function getCurrentTime() {
  const now = new Date();
  return { hour: now.getHours(), minute: now.getMinutes() };
}

function getCurrentDate() {
  const now = new Date();
  const options = { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' };
  return now.toLocaleDateString(undefined, options);
}

function formatTime(time) {
  const hour12 = time.hour % 12 || 12;
  const minute = time.minute.toString().padStart(2, '0');
  const period = time.hour >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minute} ${period}`;
}

function convertTime(time, userTimeZone, targetTimeZoneOffset) {
  const { hour, minute } = time;

  const userOffset = -1 * new Date().getTimezoneOffset() / 60;
  const targetOffsetDiff = targetTimeZoneOffset - userOffset;

  const currentDate = new Date();
  currentDate.setHours(hour);
  currentDate.setMinutes(minute);

  const targetDate = new Date(currentDate.getTime() + targetOffsetDiff * 60 * 60 * 1000);

  const targetOptions = {
    timeZone: userTimeZone,
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const targetTime = new Intl.DateTimeFormat(undefined, targetOptions).format(targetDate);
  return targetTime;
}



