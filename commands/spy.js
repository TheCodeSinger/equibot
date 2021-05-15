/**
 * TODO: This command is not complete. Needs more thought about what it should
 * even do.
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const spyLink = `https://www.tornstats.com/api.php?key=${client.auth.apiKey}&action=spy&target=`;

  function getStatEmbed(stats, name) {
    return {
      embed: {
        color: client.config.colors.default,
        author: {
          name: name
        },
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
          }
        ]
      }
    }
  }

  try {
    if (args[0]) {
      fetch((spyLink + args[0]))
        .then(res => res.json())
        .then(data => {
          const stats = data.spy.status ? data.spy : {};
          message.channel.send(getStatEmbed(stats, args[0]));
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
  usage: 'spy <player name>',
};
