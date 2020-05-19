exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    let lotto = client.lotto;
    const config = client.config;

    if (lotto) {
      // Already a game of lotto running. Display the lotto info.
      client.decorateUser(lotto.starter, message);
      const lottoInfo = {
        'embed': {
          'color': config.color,
          'title': lotto.starter.tornName + ' is running a lotto for *' + lotto.prize + '*',
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

    client.decorateUser(lotto.starter, message);

    const output = {
      embed: {
        color: config.color,
        // author: {
        //   name: 'New lotto started!'
        // },
        title: lotto.starter.tornName + ' started a new lotto for *' + lotto.prize + '*',
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

exports.shutdown = async (client) => {
  try {
    if (client.lotto) {
      client.logger.log('Shutting down lotto...');
      client.lotto.channel.send('I\'m being rebooted, so I need to cancel this lotto. Blame the  \*cough\*  @API Developer Don\'t  \*cough\*  blame  \*gasp\*  me.');
      client.lotto = null;
      client.logger.log('Lotto has been shutdown.');
    }
  } catch (e) {
    client.logger.error(`Error shutting down 'lotto' command: ${e}`);
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
  detailedDescription: 'Starts a lotto contest which is a free drawing for any member who joins.\n\nStarter Commands\n\t!lotto, !lastcall, !draw, !cancel\n\nParticipant Commands\n\t!join, !goodgame, !thankyou',
  usage: 'lotto',
};
