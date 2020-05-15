exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    let lotto = client.lotto;
    const config = client.config;

    if (lotto) {
      // Already a game of lotto running. Display the lotto info.
      const lottoInfo = {
        'embed': {
          'color': config.color,
          'title': lotto.starter.username + ' is running a lotto for *' + lotto.prize + '*',
          'fields': [
            {
              'name': 'Number of entrants: ',
              'value': lotto.joins.length,
            },
          ]
        }
      };
      return lotto.channel.send(lottoInfo);
    }

    if (!args[0]) {
      return message.reply('You did not specify a prize. Lottos are more fun when you actually offer something to win.');
    }

    // Must set the original reference.
    lotto = client.lotto = {
      starter: message.author,
      channel: message.channel,
      prize: args.join(' '),
      lc: true,
      joins: [],
      ggs: [],
      tys: [],
      roasts: [],
    };

    const output = {
      embed: {
        color: config.color,
        // author: {
        //   name: 'New lotto started!'
        // },
        title: lotto.starter.username + ' started a new lotto for *' + lotto.prize + '*',
        fields: [
          {
            name: 'Starter commands:',
            value: '`' + config.prefix + 'lc` Announce last call\n' +
              '`' + config.prefix + 'draw` Draw the winner\n' +
              '`' + config.prefix + 'cancel` Cancel the lotto'
          },
          {
            name: 'Player commands:',
            value: '`' + config.prefix + 'j` Join'
          }
        ]
      }
    };
    message.channel.send(output);
    message.delete();

  } catch (e) {
    client.logger.error(`Error executing 'lotto' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'lotto',
  category: 'Faction',
  description: 'Starts a lotto contest.',
  usage: 'lotto',
};
