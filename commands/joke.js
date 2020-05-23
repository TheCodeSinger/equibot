/**
 * TODO:
 *   1. Add support for interactive joke types, like knock-knock.
 */

/**
 * Displays a random joke.
 *
 * INSTALLATION:
 * Copy `../modules/jokes.json.template` to `../modules/jokes.json` and add
 * jokes.
 *
 * @example   !joke
 * @example   !joke oneliner
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const specifiedType = (args[0] || '').toLowerCase();
    let jokes;

    if (specifiedType) {
      // Find a matching joke type from the list.
      jokes = client.jokes.get(specifiedType) || client.jokes.get(client.jokeAliases.get(specifiedType));
    } else {
      // No type specified. Select a random type.
      jokes = client.jokes.get(client.getRandomItem(client.jokeTypes));
    }

    if (!jokes) {
      // Specified joke type not known.
      return message.reply(`I don't know any jokes of that variety. Send your suggestions using \`idea\` command.`);
    }

    const oneLinerEmbed = {
      embed: {
        color: client.config.colors.default,
        description: client.getRandomItem(jokes),
      }
    };

    message.channel.send(oneLinerEmbed);
  } catch (e) {
    client.logger.error(`Error executing 'joke' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'joke',
  category: 'Fun',
  description: 'Displays a random joke.',
  detailedDescription: 'Displays a random joke. You can optionally specify a type, like one-liner or knock-knock. For example: \'!joke kk\' or \'!joke 1l\'. Honestly, though, I don\'t know any knock-knock jokes yet.',
  usage: 'joke [type]',
};
