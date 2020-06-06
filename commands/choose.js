const moment = require("moment");

/**
 * Randomly chooses one of the provided options.
 *
 * @example   !choose eq1 eq2
 * @example   !choose Peter Hook Tinkerbell
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (args.length < 2) {
      return message.reply('Provide at least two options and I will select one at random.');
    }

    const selectedIndex = Math.floor(Math.random() * args.length);
    client.logger.debug(`selectedIndex: ${selectedIndex}`);

    const embed = {
      embed: {
        color: client.config.colors.default,
        description: `I choose "${args[selectedIndex]}"`,
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
  detailedDescription: 'Chooses at random one of provided options. Each option must be a single word.',
  usage: 'choose <optionOne> <optionTwo> <optionThree> ...',
};
