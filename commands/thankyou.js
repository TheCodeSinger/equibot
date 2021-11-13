exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const lotto = client.lotto;

    if (!lotto) {
      return message.reply('No active lotto. Why don\'t you start one?');
    }

    if (!lotto.winner) {
      return message.reply('The winner for this lotto hasn\'t been drawn yet.');
    }

    client.decorateUser(message.author, message);
    client.decorateUser(lotto.starter, message);

    const starterMessages = [
      ':clap: ' + message.author.tornName + ' says, "A big round of applause for me. Thank you!"',
      ':clap: ' + message.author.tornName + ' says, "Yes, that was generous of me, wasn\'t it?"',
    ]

    const winnerMessages = [
      ':smile: ' + message.author.tornName + ' says, "Thank you ' + lotto.starter.toString() + '!"',
    ]

    const loserMessages = [
      ':moneybag: ' + message.author.tornName + ' says, "' + lotto.starter.tornName + ' Thank you for the lotto!"',
      ':sunglasses: ' + message.author.tornName + ' says, "Thanks for the lotto, ' + lotto.starter.tornName + '. Do another one!!"',
      ':clap: ' + message.author.tornName + ' says, "Thanks for a chance to win, ' + lotto.starter.tornName + '!"',
      ':money_with_wings: ' + message.author.tornName + ' says, "Thanks to ' + lotto.starter.tornName + ' for showing off their wealth!"',
    ];

    let messages = loserMessages;
    if (lotto.starter === message.author) {
      messages = starterMessages;
    } else if (lotto.winner === message.author) {
      messages = winnerMessages;
    }

    if (!lotto.tys.includes(message.author)) {
      lotto.channel.send(client.getRandomItem(messages));
      lotto.tys.push(message.author);
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
