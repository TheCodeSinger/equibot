exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const output = {
      'embed': {
        'color': client.config.color,
        'author': {
          'name': 'verb'
        },
        'title': 'Blaking (blāk′ ĭng)',
        'description': 'The art of going to Switzerland for rehab, flying back, and realizing you forgot to rehab.'
      }
    };
    message.channel.send(output);
  } catch (e) {
    client.logger.error(`Error executing 'blaking' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['blakey'],
  permLevel: 'User',
};

exports.help = {
  name: 'blaking',
};
