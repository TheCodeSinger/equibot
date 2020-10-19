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

    const idea = `${message.author.toString()} sends the following message: ${args.join(' ')}`;

    /**
     * Send DM to developers.
     *   Aarlo: 550079162564476997
     *   kastang: 576918909672751124
     *   Orion: 320016515602579456
     */
    const developerIds = ['550079162564476997', '576918909672751124', '320016515602579456'];
    developerIds.forEach(id => {
      const developer = message.guild.member(id);
      developer.send(idea);
    });

    /**
     * Send to a channel.
     *   #api-dev: 680114562057502771
     */
    const channel = client.channels.cache.find(channel => channel.id === '680114562057502771');
    channel.send(idea);

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
