/**
 * Displays a clickable link to the Torn profile for the specified member.
 *
 * @example   !link @Aarlo
 */
 exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (!args[0]) {
      message.channel.send('You must provide a message to pass on to the developer.');
      return;
    }
    // Get the Developer's User object: Aarlo#2177
    let developer = message.guild.member('550079162564476997');
    developer.send(`${message.author.toString()} sends the following bug message: ${args.join(' ')}`);
  } catch (e) {
    client.logger.error(`Error executing 'bug' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'User'
};

exports.help = {
  name: 'bug',
  category: 'System',
  description: 'Sends a message to the bot developer.',
  usage: 'bug <description of bug, question, or comment>'
};
