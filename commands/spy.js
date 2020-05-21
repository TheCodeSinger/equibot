/**
 * TODO: This command is not complete. Needs more thought about what it should
 * even do.
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const spyLink = `https://www.tornstats.com/api.php?key=${client.auth.apiKey}&action=spy&target=`;

  function getStatEmbed(stats, name) {
    return {
      'embed': {
        'color': client.config.color,
        'author': {
          'name': name
        },
        'fields': [
          {
            'name': 'Strength',
            'value': stats.strength || 'n/a',
            'inline': true
          },
          {
            'name': 'Defense',
            'value': stats.defense || 'n/a',
            'inline': true
          },
          {
            'name': 'Speed',
            'value': stats.speed || 'n/a',
            'inline': true
          },
          {
            'name': 'Dexterity',
            'value': stats.dexterity || 'n/a',
            'inline': true
          },
          {
            'name': 'Total',
            'value': stats.total || 'n/a',
            'inline': true
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
  enabled: false,
  guildOnly: false,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'spy',
  category: 'Faction',
  description: 'Spies on a target.',
  usage: 'spy',
};
