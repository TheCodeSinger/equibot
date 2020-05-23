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
      ':clap: ' + message.author.tornName + ' says, "Well done ' + lotto.winner.toString() + ', you couldn\'t have done it without me!',
      ':poop: ' + message.author.tornName + ' says, "Ugh.. I was hoping for anyone but ' + lotto.winner.toString(),
    ]

    const winnerMessages = [
      ':smile: ' + message.author.tornName + ' says, "I\'m the worst!',
    ]

    const loserMessages = [
      '',
    ];

    const penceRoasts = [
      'I\'m 60 years old. I believe in taking care of myself, and a balanced diet and a rigorous taser training routine.',
      'Weird ok but flex',
      'Jesus Christ how many times did you drop your dad on his head when you were a child?',
      'NAME you sir are a buffoon.\nYou do know we dont all cheat when playing this game?\nYou bragging about winning a lotto does not sit well with most of us NAME.',
    ];

    let messages = loserMessages;
    if (lotto.starter === message.author) {
      messages = starterMessages;
    } else if (lotto.winner === message.author) {
      messages = winnerMessages;
    }

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
