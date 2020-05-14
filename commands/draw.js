exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (!client.lotto) {
      return message.reply('No active lotto. Why don\'t you start one?');
    }

    if (message.author !== client.lotto.starter) {
      return message.reply('Nice try, but only the lotto starter can draw the prize.');
    }

    if (!client.lotto.joins.length) {
      return message.reply(
        'Not so fast! No one has joined the lotto yet. If you are having cold feet you should `' +
        client.config.prefix + 'cancel` the lotto.');
    }

    if (client.lotto.winner) {
      return message.reply('The winner for this lotto has already been drawn.');
    }

    if (message.channel !== client.lotto.channel) {
      return message.reply('Please draw in the channel where the lotto is running.');
    }

    message.delete();
    client.lotto.winner = client.getRandomItem(client.lotto.joins);

    client.decorateUser(client.lotto.winner, message);

    const output = {
      // 'content': ':tada: ' + client.lotto.winner.toString() + ' :tada:',
      'embed': {
        'color': client.config.color,
        'fields': [
          {
            'name': 'The winner is revealed!',
            'value': client.lotto.winner.toString() + ' won **' + client.lotto.prize + '** from ' + client.lotto.starter.toString()
          },
          {
            'name': 'Links for the host:',
            'value': '[' + client.lotto.winner.discordName + '](' + client.lotto.winner.tornLink +
              ')\n Please copy the sent message in the next 5 minutes to close the lotto.'
          },
          {
            'name': 'Show your love:',
            'value': '`' + client.config.prefix + 'gg` - Congratulate the winner\n `' + client.config.prefix + 'ty` - Thank the host'
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
          client.lotto.channel.send('Prize has been recorded. Lotto for **' + client.lotto.prize +  '** is now closed.');
          client.lotto = null;
        })
        .catch(() => {
          client.lotto.channel.send('Lotto for **' + client.lotto.prize +  '** is now closed. ' + client.lotto.starter.toString() +
            ', did you send the prize to ' + client.lotto.winner.toString() + '?');
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
