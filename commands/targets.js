exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const output = {
      'embed': {
        'color': client.config.colors.default,
        'description': 'EQ Targets App: http://torneq.com/#!/targets',
      }
    };
    message.channel.send(output);
  } catch (e) {
    client.logger.error(`Error executing 'targets' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'targets',
  category: 'Faction',
  description: 'Displays a link to torneq.com.',
  usage: 'targets',
};
