const moment = require("moment");

/**
 * Randomly chooses one of the provided options separated by commas, otherwise
 * spaces.
 *
 * @example   !choose eq1 eq2
 * @example   !choose Peterpan, Captain Hook, Tinkerbell
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const argString = args.join(' ');
    let selections = args;
    let selected = '';

    if (args.length < 2) {
      return message.reply('Provide at least two options and I will select one at random.');
    }
    if (argString.indexOf(',') > -1) {
      // List is comma-delimited.
      selections = argString.split(',');
      selection = selections[Math.floor(Math.random() * selections.length)];
    }
    client.logger.debug(`selections: ${JSON.stringify(selections)}`);

    selected = selections[Math.floor(Math.random() * selections.length)];
    client.logger.debug(`selected: ${selected}`);

    const embed = {
      embed: {
        color: client.config.colors.default,
        description: `I choose "${selected.trim()}"`,
        footer: {
          text: `The choices were ${argString}`,
        }
      }
    };

    message.channel.send(embed);
  } catch (e) {
    client.logger.error(`Error executing 'choose' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['pick'],
  permLevel: 'User',
};

exports.help = {
  name: 'choose',
  category: 'Fun',
  description: 'Chooses one of provided options.',
  detailedDescription: 'Chooses at random one of provided options. If any option is more than one word, you must use commas to separate all options. Otherwise, you can simply use spaces to separate single-word options.',
  usage: 'choose <option one>, <option two>, <option three>, ...',
};
