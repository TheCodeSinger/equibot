/**
 * Displays last known spy report for specified player. Draws from TornStats.
 *
 * Planned Enhancements:
 *   1. Disallow in public channels.
 *
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const spyLink = `https://www.tornstats.com/api/v1/${client.auth.apiKey}/spy/`;
  function getStatEmbed(stats, name) {
    if (!stats) {
      return `No player by the name \`${name}\``;
    }

    if (!stats.status) {
      return `No known spy report for \`${name}\``;
    }

    return {
      embed: {
        color: client.config.colors.default,
        title: name,
        fields: [
          {
            name: 'Strength',
            value: stats.strength.toLocaleString() || 'n/a',
          },
          {
            name: 'Speed',
            value: stats.speed.toLocaleString() || 'n/a',
          },
          {
            name: 'Dexterity',
            value: stats.dexterity.toLocaleString() || 'n/a',
          },
          {
            name: 'Defense',
            value: stats.defense.toLocaleString() || 'n/a',
          },
          {
            name: 'Total',
            value: stats.total.toLocaleString() || 'n/a',
          },
        ],
        footer: {
          text: `Last spied: ${stats.difference}`,
        }
      }
    }
  }

  try {
    if (args[0]) {
      fetch((spyLink + args[0]))
        .then(res => res.json())
        .then(data => {
          client.logger.debug(`spy data for ${args[0]}: ${JSON.stringify(data)}`);

          message.channel.send(getStatEmbed(data.spy, args[0]));
        })
        .catch(error => {client.logger.error(error)});
    } else {
      message.channel.send('Please tell me who to spy on!');
    }
  } catch (e) {
    client.logger.error(`Error executing 'spy' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'spy',
  category: 'Torn',
  description: 'Prints last known spy report.',
  usage: 'spy <player name or id>',
};
