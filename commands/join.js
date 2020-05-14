exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (!client.lotto) {
      message.reply('No active lotto. Why don\'t you start one?');
      return;
    }

    if (client.lotto.winner) {
      message.reply('Sorry, the winner has already been drawn. You\'ll have to wait for the next lotto.');
      return;
    }

    if (client.lotto.starter === message.author) {
      message.reply('Hey! No shenanigans. You can\'t join your own lotto.');
      return;
    }

    if (client.lotto.joins.includes(message.author)) {
      message.reply('You have already joined this lotto.');
      return;
    }

    // Add this user to the list of joins.
    client.lotto.joins.push(message.author);

    const output = {
      'embed': {
        'color': client.config.color,
        'description': message.author.toString() + ' joined as number ' + client.lotto.joins.length,
        // 'footer': {
        //   'text': 'Join now to have a chance at winning ' + client.lotto.prize
        // }
      }
    };
    client.lotto.channel.send(output);
    message.delete();

  } catch (e) {
    client.logger.error(`Error executing 'join' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ['j'],
  permLevel: 'User',
};

exports.help = {
  name: 'join',
};
