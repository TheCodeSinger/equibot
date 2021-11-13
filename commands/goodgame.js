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

    const starterMessages = [
      ':clap: ' + message.author.tornName + ' shouts, "Horray for ' + lotto.winner.toString() + '!"',
    ]

    const winnerMessages = [
      ':money_mouth: ' + message.author.tornName + ' shouts, "I WON!! WOOHOO!"',
      ':money_mouth: ' + message.author.tornName + ' shouts, "ME!!!"',
      ':money_mouth: ' + message.author.tornName + ' shouts, "Yay, me!"',
    ]

    const loserMessages = [
      ':tada: ' + message.author.tornName + ' congratulates ' + lotto.winner.toString() + ' :tada:',
    ];

    let messages = loserMessages;
    if (lotto.starter === message.author) {
      messages = starterMessages;
    } else if (lotto.winner === message.author) {
      messages = winnerMessages;
    }

    if (!lotto.ggs.includes(message.author)) {
      lotto.channel.send(client.getRandomItem(messages));
      lotto.ggs.push(message.author);
    }

    message.delete();

  } catch (e) {
    client.logger.error(`Error executing 'goodgame' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ['gg'],
  permLevel: 'User',
};

exports.help = {
  name: 'goodgame',
};
