exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const lotto = client.lotto;
    let messages;

    if (!lotto) {
      return message.reply('No active lotto. Why don\'t you start one?');
    }

    if (!lotto.winner) {
      return message.reply('The winner for this lotto hasn\'t been drawn yet.');
    }

    client.decorateUser(message.author, message);

    const starterMessages = [
      ':clap: ' + message.author.tornName + ' says, "Well done ' + lotto.winner.toString() + ', you couldn\'t have done it without me!',
      ':poop: ' + message.author.tornName + ' says, "Ugh.. I was hoping for anyone but ' + lotto.winner.toString(),
    ]

    const winnerMessages = [
      ':smile: ' + message.author.tornName + ' says, "I\'m the worst!',
    ]

    const loserMessages = [
      'Weird ok but flex',
      'How many times did you drop your dad on his head when you were a child?',
      lotto.winner.toString() + ', you sir are a buffoon.\nYou do know we don\'t all cheat when playing this game?\nYou bragging about winning a lotto does not sit well with most of us.',
    ];

    switch (message.author) {
      case lotto.starter:
        messages = starterMessages;
        break;

      case lotto.winner:
        messages = winnerMessages;
        break;

      default:
        messages = loserMessages;
    }

    lotto.roasts = lotto.roasts || [];
    if (!lotto.roasts.includes(message.author)) {
      lotto.channel.send(client.getRandomItem(messages));
      lotto.roasts.push(message.author);
    }

    message.delete();

  } catch (e) {
    client.logger.error(`Error executing 'roast' command: ${e}`);
  }
};

exports.conf = {
  enabled: false,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'roast',
};
