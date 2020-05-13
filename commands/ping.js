exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const msg = await message.channel.send("Ping?");
  try {
    msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms.`);

    // TODO: Need to figure out how to get the API ping.
    // msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  } catch (e) {
    client.logger.error(`Error executing 'ping' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'ping',
  category: 'General',
  description: 'Displays server-bot latency.',
  usage: 'ping',
};
