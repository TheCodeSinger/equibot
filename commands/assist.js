/**
 * Calls for an assist. This command will find the author's current fight and
 * provide a convenience link to the target.
 *
 * Future enhancments:
 *   1. Watch the fight and clean up after it is over.
 *   2. Provide stats estimate.
 *
 * @example   !assist
 */
 exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const attackUrl = `https://www.torn.com/loader.php?sid=attack&user2ID=`;

    if (args.length < 3) {
     return message.channel.send(`Usage: !assist Metallistar Duke 4`);
    }

    const attackerName = args[0];
    const defenderName = args[1];
    const defenderId = args[2];

    const output = {
      embed: {
        color: client.config.colors.default,
        title: `${attackerName} needs an assist!`,
        description: `Join the attack against [${defenderName}](${attackUrl}${defenderId}).`,
      }
    }
    return message.channel.send(output);

  } catch (e) {
    client.logger.error(`Error executing 'assist' command: ${e}`);
  }
};

exports.conf = {
  enabled: false,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'assist',
  // category: 'Torn',
  description: 'Calls for an assist',
  usage: 'assist attackerName defenderName defenderId',
};
