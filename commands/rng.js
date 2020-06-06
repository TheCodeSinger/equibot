const moment = require("moment");

/**
 * Randomly chooses a number from the provided range.
 *
 * @example   !rng 10
 * @example   !rng 50-100
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (!args.length) {
      return message.reply(`Provide at least an upper limit. Type \`${client.config.prefix}help rng\` for more instructions.`);
    }
    if (args.length > 1) {
      return message.reply(`Use a dash to specify a range: \`${client.config.prefix}rng 10-20\`. Type \`${client.config.prefix}help rng\` for more instructions.`);
    }

    function getRandomIntInclusive(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      const random = Math.floor(Math.random() * (max - min + 1)) + min;
      client.logger.debug(`Random ${min}-${max} => ${JSON.stringify(random)}`);
      return random;
    }

    const argString = args.join(' ');
    // Defaults for a single value. For example: !rng 10
    let max = Number(args[0]);
    let min = 1;

    if (argString.indexOf('-') > -1) {
      // Use the custom range. For example: !rng 10-20
      range = argString.split('-');
      min = Number(range[0].trim());
      max = Number(range[1].trim());
    }

    const embed = {
      embed: {
        color: client.config.colors.default,
        description: `I choose ${getRandomIntInclusive(min, max)}`,
        footer: {
          text: `The range was ${min}-${max}`,
        }
      }
    };

    message.channel.send(embed);
  } catch (e) {
    client.logger.error(`Error executing 'rng' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'rng',
  category: 'Fun',
  description: 'Chooses a random number.',
  detailedDescription: 'Chooses a random number from the provided range (e.g. `rng 50-100`). If you provide only one number, I will treat that as the upper limit in a range with `1` as the lower limit.',
  usage: '\n  rng 10 => same as 1-10\n  rng 50-100',
};
