/**
 * Speak through PommesBotMayo.
 *
 * @example   !speak I wish I had a body.
 */
 exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (!args[0]) {
      message.channel.send('You must provide a channel name and message for PommesBotMayo to speak.');
      return;
    }
    const channel = client.channels.cache.find(channel => channel.name === args[0]);
    const msg = args.splice(1).join(' ');
    if (channel) {
      channel.send(msg);
    } else {
      message.channel.send(`No channel found with name ${args[0]}.`);
      client.logger.debug(`No channel found with name ${args[0]}.`);
    }

  } catch (e) {
    client.logger.error(`Error executing 'speak' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'Bot Admin'
};

exports.help = {
  name: 'speak',
  category: 'System',
  description: 'Speaks a message through the bot.',
  usage: 'speak <channel> <message>'
};