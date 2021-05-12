exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {

    const output = {
      embed: {
        color: client.config.colors.default,
        image: {
          url: 'https://media1.tenor.com/images/fb3c5c278035cf4ec0d358f7ae9d70ca/tenor.gif?itemid=16108395',
        },
      }
    };

    message.channel.send(output);
  } catch (e) {
    client.logger.error(`Error executing 'salt' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [''],
  permLevel: 'User',
};

exports.help = {
  name: 'salt',
  category: 'Fun',
  description: 'Expresses one\'s saltiness.',
  usage: 'salt',
};

