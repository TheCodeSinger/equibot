exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const output = {
      'embed': {
        'color': client.config.colors.default,
        'author': {
          'name': 'verb'
        },
        'title': 'granding (grand′ ĭng)',
        'description': 'The act of starting a lotto and then promptly forgetting you started a lotto.'
      }
    };
    message.channel.send(output);
  } catch (e) {
    client.logger.error(`Error executing 'granding' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'granding',
};
