exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (!client.lotto) {
      return message.reply('No active lotto. Why don\'t you start one?');
    }

    if (message.author !== client.lotto.starter) {
      return message.reply('Only the starter can cancel a lotto.');
    }

    const output = {
      'embed': {
        'color': client.config.color,
        'description': 'It appears that ' + client.lotto.starter.toString() + ' got cold feet and cancelled the lotto.',
        'footer': {
          'text': 'They probably deserve to be TP\'d or forked or some other innocous but socially approved form of hazing.'
        }
      }
    };
    client.lotto.channel.send(output);
    client.lotto = null;

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
  name: 'cancel',
};
