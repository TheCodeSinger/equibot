exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (!client.lotto) {
      return message.reply('No active lotto. Why don\'t you start one?');
    }

    if (!client.lotto.winner) {
      return message.reply('The winner for this lotto hasn\'t been drawn yet.');
    }

    const starterMessages = [
      ':clap: A big round of applause for me. Thank you!',
    ]

    const winnerMessages = [
      ':smile: Thank you ' + client.lotto.starter.toString() + '!',
    ]

    const loserMessages = [
      ':Money_Bag_Emoji_large: Thanks for the lotto!',
      ':sunglasses: Thanks for the lotto. Do another one!!',
      ':clap: Thanks for a chance to win!',
      ':money_with_wings: Thanks to ' + client.lotto.starter.toString() + ' for showing off their wealth!',
    ];

    let messages = loserMessages;
    if (client.lotto.starter === message.author) {
      messages = starterMessages;
    } else if (client.lotto.winner === message.author) {
      messages = winnerMessages;
    }

    if (!client.lotto.tys.includes(message.author)) {
      client.lotto.channel.send(client.getRandomItem(messages));
      client.lotto.tys.push(message.author);
    }

    message.delete();

  } catch (e) {
    client.logger.error(`Error executing 'thankyou' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ['ty'],
  permLevel: 'User',
};

exports.help = {
  name: 'thankyou',
};
