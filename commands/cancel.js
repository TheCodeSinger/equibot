exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const lotto = client.lotto;
    const config = client.config;
    const isBotAdmin = client.levelCache['Bot Support'] <= level;

    if (!lotto) {
      return message.reply('No active lotto. Why don\'t you start one?');
    }

    if (message.author !== lotto.starter && !isBotAdmin) {
      return message.reply('Only the starter can cancel a lotto.');
    }

    const output = {
      'embed': {
        'color': config.color,
        'description': 'It appears that ' + message.author.toString() + ' got cold feet and cancelled the lotto.',
        'footer': {
          'text': 'They probably deserve to be TP\'d or forked or some other innocous but socially approved form of hazing.'
        }
      }
    };

    message.reply('Are you sure you want to cancel this lotto? [yes/no]')
      .then(() => {
        message.channel
          .awaitMessages(response =>
            (response.author.username === message.author.username),
            {
              max: 1,
              time: 7000, // 7 seconds
              errors: ['time'],
            }
          )
          .then((collected) => {
            switch(collected.first().cleanContent.toLowerCase()) {
              case 'yes':
              case 'y':
                lotto.channel.send(output);
                  // Must use the original reference when setting null.
                client.lotto = null;
                break;

              case 'no':
              case 'n':
                message.reply('Phew! Aren\'t you glad I asked!');
                break;

              default:
                message.reply('Not sure what you mean by that response. If you still need to cancel, ask me again.');
            }
          })
          .catch((collected) => {
            message.reply('Done waiting. If you still need to cancel, ask me again.');
          });
      });

  } catch (e) {
    client.logger.error(`Error executing 'cancel' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'cancel',
};
