exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    message.channel.send('https://discord.gg/eKCNJH2');
  } catch (e) {
    client.logger.error(`Error executing 'invite' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'invite',
  category: 'Faction',
  description: 'Displays a Discord invitation.',
  usage: 'invite',
};
