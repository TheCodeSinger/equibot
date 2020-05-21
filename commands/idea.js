/**
 * Displays a clickable link to the Torn profile for the specified member.
 *
 * @example   !idea I think we should have a way to send in our ideas.
 */
 exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (!args[0]) {
      message.channel.send('You must provide a message to pass on to the developer.');
      return;
    }
    // Get the Developer's User object: Aarlo#2177
    let developer = message.guild.member('550079162564476997');
    developer.send(`${message.author.toString()} sends the following message: ${args.join(' ')}`);
    message.reply('Message sent. Thank you for your feedback!');
  } catch (e) {
    client.logger.error(`Error executing 'idea' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['bug', 'idea', 'feedback', 'suggestion'],
  permLevel: 'User'
};

exports.help = {
  name: 'idea',
  category: 'System',
  description: 'Sends message to bot developer.',
  usage: 'idea <description of idea, bug, suggestion, or comment>'
};
