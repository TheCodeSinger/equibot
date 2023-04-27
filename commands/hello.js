/**
 * Hello world.
 *
 * @example   !test
 */
 exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    message.channel.send('Hello world!');
  } catch (e) {
    client.logger.error(`Error executing 'hello' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'Bot Admin'
};

exports.help = {
  name: 'hello',
  // category: 'System',
  description: 'For testing.',
  usage: 'hello'
};
