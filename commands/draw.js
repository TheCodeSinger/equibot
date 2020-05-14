exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const lotto = client.lotto;
    const config = client.config;

    if (!lotto) {
      return message.reply('No active lotto. Why don\'t you start one?');
    }

    if (message.author !== lotto.starter) {
      return message.reply('Nice try, but only the lotto starter can draw the prize.');
    }

    if (!lotto.joins.length) {
      return message.reply(
        'Not so fast! No one has joined the lotto yet. If you are having cold feet you should `' +
        config.prefix + 'cancel` the lotto.');
    }

    if (lotto.winner) {
      return message.reply('The winner for this lotto has already been drawn.');
    }

    if (message.channel !== lotto.channel) {
      return message.reply('Please draw in the channel where the lotto is running.');
    }

    message.delete();
    lotto.winner = client.getRandomItem(lotto.joins);

    client.decorateUser(lotto.winner, message);
    client.decorateUser(lotto.starter, message);

    const output = {
      // 'content': ':tada: ' + lotto.winner.toString() + ' :tada:',
      'embed': {
        'color': config.color,
        'fields': [
          {
            'name': 'The winner is revealed!',
            'value': lotto.winner.toString() + ' won **' + lotto.prize + '** from ' + lotto.starter.tornName + '.'
          },
          {
            'name': 'Link to winner\'s profile:',
            'value': '[' + lotto.winner.discordName + '](' + lotto.winner.tornLink + ')',
          },
          {
            'name': 'Link to your items page:',
            'value': '[https://www.torn.com/item.php](https://www.torn.com/item.php)\n' +
              'Please copy the sent message in the next 5 minutes to close the lotto.'
          },
          {
            'name': 'Show your love:',
            'value': '`' + config.prefix + 'gg` - Congratulate the winner\n `' + config.prefix + 'ty` - Thank the host'
          }
        ]
      }
    };
    message.channel.send(output).then(() => {
      message.channel
        .awaitMessages(response => (response.author === message.author && response.content.includes('You sent')),
          {
            max: 1,
            time: 300000,
            errors: ['time'],
          }
        )
        .then((collected) => {
          lotto.channel.send('Prize has been recorded. Lotto for **' + lotto.prize +  '** is now closed.');

          // Must use the original reference when setting null.
          client.lotto = null;
        })
        .catch(() => {
          lotto.channel.send('Lotto for **' + lotto.prize +  '** is now closed. ' + lotto.starter.toString() +
            ', did you send the prize to ' + lotto.winner.toString() + '?');

            // Must use the original reference when setting null.
          client.lotto = null;
        });
    });


  } catch (e) {
    client.logger.error(`Error executing 'draw' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'draw',
};
