exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (client.lotto) {
      return message.reply('There is already a game running. You\'ll have to wait until this one is done.');
    }

    if (!args[0]) {
      return message.reply('You did not specify a prize. Lottos are more fun when you actually offer something to win.');
    }

    // message.delete();
    client.lotto = {
      'starter': message.author,
      'channel': message.channel,
      'prize': args.join(' '),
      'lc': true,
      'joins': [],
      'ggs': [],
      'tys': []
    };

    const output = {
      'embed': {
        'color': client.config.color,
        // 'author': {
        //   'name': 'New lotto started!'
        // },
        'title': client.lotto.starter.username + ' started a new lotto for *' + client.lotto.prize + '*',
        'fields': [
          {
            'name': 'Starter commands:',
            'value': '`' + client.config.prefix + 'lc` Announce last call\n' +
              '`' + client.config.prefix + 'draw` Draw the winner\n' +
              '`' + client.config.prefix + 'cancel` Cancel the lotto'
          },
          {
            'name': 'Player commands:',
            'value': '`' + client.config.prefix + 'j` Join'
          }
        ]
      }
    };
    message.channel.send(output);

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
