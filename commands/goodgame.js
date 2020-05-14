exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (!client.lotto) {
      return message.reply('No active lotto. Why don\'t you start one?');
    }

    if (!client.lotto.winner) {
      return message.reply('The winner for this lotto hasn\'t been drawn yet.');
    }

    const starterMessages = [
      ':clap: Horray for ' + client.lotto.winner.toString() + '!',
    ]

    const winnerMessages = [
      ':money_mouth: I WON!! WOOHOO!',
    ]

    const loserMessages = [
      ':tada: ' + message.author.toString() + ' congratulates ' + client.lotto.winner.toString() + ' :tada:',
    ];

    let messages = loserMessages;
    if (client.lotto.starter === message.author) {
      messages = starterMessages;
    } else if (client.lotto.winner === message.author) {
      messages = winnerMessages;
    }

    if (!client.lotto.ggs.includes(message.author)) {
      client.lotto.channel.send(client.getRandomItem(messages));
      client.lotto.ggs.push(message.author);
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
