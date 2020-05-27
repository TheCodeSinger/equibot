const moment = require("moment");

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    let stats;

    if (args[0]) {
      const guildMember = message.guild.member(message.mentions.users.first());
      if (!guildMember) {
        return message.reply('Use a properly tagged Discord name.');
      }

      stats = client.ensureMemberStats(guildMember.id);
      client.logger.debug(`Stats for ${guildMember.id}: ${JSON.stringify(stats)}`);
      const memberStatsEmbed = {
        content: `Game stats for ${guildMember.toString()}`,
        embed: {
          color: client.config.colors.default,
          title: `Game stats for ${guildMember.nickname}`,
          fields: [
            {
              name: 'Number of Lottos Hosted',
              value: stats.lotto.completed,
            },
            {
              name: 'Value of Prizes Awarded',
              value: client.formatCurrency(stats.lotto.valueAwarded),
            },
            {
              name: 'Value of Prizes Won',
              value: client.formatCurrency(stats.lotto.valueWon),
            },
          ],
          footer: {
            text: `Since ${moment(stats.startDate).format('MMMM D YYYY')}`,
          }
        }
      };
      return message.channel.send(memberStatsEmbed);
    }

    stats = client.games.get('lotto') || {};
    client.logger.debug(`Stats for Server: ${JSON.stringify(stats)}`);
    const serverStatsEmbed = {
      embed: {
        color: client.config.colors.default,
        title: 'Lotto stats for the server',
        fields: [
          {
            name: 'Number of Lottos Hosted',
            value: stats.totals.completed,
          },
          {
            name: 'Value of Prizes Awarded',
            value: client.formatCurrency(stats.totals.valueAwarded),
          },
          {
            name: 'Records for a Single Lotto',
            value: `Most Participants: ${stats.records.mostParticipants}\nHighest Value: ${client.formatCurrency(stats.records.highestValue)}\nLongest Running Lotto: ${client.humanizeSeconds(stats.records.longestDuration/1000)}`,
          },
        ],
        footer: {
          text: `Since ${moment(stats.startDate).format('MMMM D YYYY')}`,
        }
      }
    };
    message.channel.send(serverStatsEmbed);

  } catch (e) {
    client.logger.error(`Error executing 'gamestats' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ['gstats'],
  permLevel: 'User',
};

exports.help = {
  name: 'gamestats',
  category: 'Fun',
  description: 'Displays game stats.',
  detailedDescription: 'Displays game stats pertaining to a member, if specified. Otherwise total game stats for the server.',
  usage: 'gamestats <@Member>'
};
