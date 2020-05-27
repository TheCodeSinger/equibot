const { version } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

exports.run = (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const duration = moment.duration(client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
    message.channel.send(`= STATISTICS =
• Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
• Uptime     :: ${duration}
• Users      :: ${client.users.cache.size.toLocaleString()}
• Servers    :: ${client.guilds.cache.size.toLocaleString()}
• Channels   :: ${client.channels.cache.size.toLocaleString()}
• Discord.js :: v${version}
• Node       :: ${process.version}`, {code: 'asciidoc'});
  } catch (e) {
    client.logger.error(`Error executing 'stats' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'User'
};

exports.help = {
  name: 'botstats',
  category: 'System',
  description: 'Displays bot statistics',
  usage: 'botstats'
};
