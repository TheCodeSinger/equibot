exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const pingInsulted = !!args[1];
    const insultAuthor = !args.length;
    const author = client.decorateUser(message.author, message);
    const mentioned = message.mentions.members.first();
    const resolvedUser = client.decorateUser(mentioned, message);

    /**
     * Determines who to insult and also formats the string for display.
     *
     * @returns string Formatted string of member to insult.
     */
    function getInsultedName() {
      if (insultAuthor) {
        // Insult the author because they specified no member to insult.
        return '**' + author.tornName + '**';
      }

      if (!resolvedUser) {
        // Use the name as typed because it did not match any known member.
        return '**' + args.join(' ').replace('@', '') + '**';
      }

      if (pingInsulted) {
        // Ping the crap out of the insulted member.
        return resolvedUser.toString();
      }

      // Do not bother the insulted member with a ping. (Default)
      return '**' + resolvedUser.tornName + '**';
    }

    const insulted = getInsultedName();
    const insults = [
      insulted + ', you’re a gray sprinkle on a rainbow cupcake.',
      insulted + ', you\'re more disappointing than a pizza with no cheese.',
      insulted + ', light travels faster than sound, which is why you seemed bright until you spoke.',
      insulted + ', you have so many gaps in your teeth that it looks like your tongue is in jail.',
      'I\'ve never forgotten the first time I met ' + insulted + ', but I keep trying.',
      insulted + ', hold still. I\'m trying to imagine you with a personality.',
      insulted + ', your face makes onions cry.',
      insulted + ', your teeth are so bad you could eat an apple through a fence.',
      insulted + ', I thought of you today. It reminded me to take out the trash.',
      insulted + ', remember that time you said a bunch of stuff I don\'t care about? It was now.',
      insulted + ', your birth certificate is actually a letter of apology from the condom factory.',
      insulted + ', you remind me of a penny: two-faced and not worth much.',
    ];

    message.channel.send(client.getRandomItem(insults));
    message.delete();
  } catch (e) {
    client.logger.error(`Error executing 'insult' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'insult',
  category: 'Fun',
  description: 'Trout someone verbally.',
  usage: 'insult <@someone>',
};
