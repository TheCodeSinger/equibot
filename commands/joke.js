/**
 * Displays a random joke.
 *
 * INSTALLATION:
 * Copy `../modules/jokes.json.template` to `../modules/jokes.json` and add
 * jokes.
 *
 * @example   !joke
 * @example   !joke oneliner
 * @example   !joke kk
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    let specifiedType = (args[0] || '').toLowerCase();
    let jokes;

    if (specifiedType) {
      // Reassign specifiedType to the proper type name.
      specifiedType = client.jokeAliases.get(specifiedType) || specifiedType;

      // Find a matching joke type from the list.
      jokes = client.jokes.get(specifiedType);
    } else {
      // No type specified. Select a random type.
      specifiedType = client.getRandomItem(client.jokeTypes);
      jokes = client.jokes.get(specifiedType);
    }

    if (!jokes) {
      // Specified joke type not known.
      return message.reply(`I don't know any jokes of that variety. Send your suggestions using \`idea\` command.`);
    }

    /**
     * Share a knock knock joke with the initiator.
     *
     * @param   {Array}   joke   The unique parts of a knock knock joke.
     */
    function knockKnock(joke) {
      const theOpening = "Knock knock!";
      const whosThere = 'Who\'s there?';
      const theName = joke[0];
      const theSetup = theName + ' who?';
      const thePunchline = joke[1];

      /**
       * Scrubs a string by removing quotes, adding question mark at the end,
       * and converting to all lowercase for better comparisons.
       *
       * @param   {String}   question   A string to scrub.
       * @return  {String}   The scrubbed string.
       */
      function scrubQuestion(question) {
        if (!question.includes('?')) {
          question = question + '?';
        }
        return question.replace('\'', '').toLowerCase();
      }

      // Send The Opening.
      message.channel.send(theOpening).then(() => {
        // Wait for the "Who's There?".
        message.channel
          .awaitMessages(response => (
            response.author === message.author && response.content.toLowerCase().match('who')
            ), { max: 1, time: 10000, errors: ['time'] })
          .then(() => {
            // Send The Name.
            message.channel.send(theName).then(() => {
              // Wait for the "NAME who?".
              message.channel
                .awaitMessages(response => (
                  response.author === message.author &&
                  scrubQuestion(response.content) === scrubQuestion(theSetup)
                ), { max: 1, time: 10000, errors: ['time'] })
                .then(() => {
                  // Send The Punchline.
                  message.channel.send(thePunchline);
                })
                .catch(() => {
                  message.channel.send(`You were supposed to answer "${theSetup}", but I'm done waiting. If you want to hear a joke, ask me again.`);
                });
            });
          })
          .catch(() => {
            message.channel.send(`You were supposed to answer "${whosThere}", but I'm done waiting. If you want to hear a joke, ask me again.`);
          });
      });
    }

    /**
     * Get a Discord embed for a one-liner joke.
     *
     * @param   {String}   joke   The text of the joke.
     */
    function getOneLinerEmbed(joke) {
      return {
        embed: {
          color: client.config.colors.default,
          description: joke,
        }
      }
    }

    /**
     * Get a Discord embed for a two-liner joke.
     *
     * @param   {String[]}   joke   The parts of the joke.
     */
    function getTwoLinerEmbed(joke) {
      return {
        embed: {
          color: client.config.colors.default,
          title: joke[0],
          description: joke[1],
        }
      }
    }

    // Select a random joke and send the message.
    var joke = client.getRandomItem(jokes);
    switch(specifiedType) {
      case 'knockknock':
        knockKnock(joke);
        break;
      case 'twoliners':
        message.channel.send(getTwoLinerEmbed(joke));
        break;
      case 'oneliners':
        message.channel.send(getOneLinerEmbed(joke));
        break;
      default:
        message.channel.send('Sorry.. I.. can\'t think of a good joke of that type.');
        client.logger.error(`Error finding 'joke' of type: ${specifiedType}`);
    }
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
  detailedDescription: 'Displays a random joke. You can optionally specify a type, like one-liner, two-liner, or knock-knock. For example: \'!joke kk\' or  \'!joke knock\' or \'!joke 1l\' or \'!joke one\' or \'!joke 2l\' or \'!joke two\'.\n\nPlease submit your favorite jokes and recommendations for additional types of jokes.',
  usage: 'joke [type]',
};
