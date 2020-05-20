exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const mentioned = message.mentions.members.first();
    const name = mentioned ? mentioned.toString() : args[0];

    const missMessages = [
      message.author.username + ' swings a trout wildly but hits nobody!',
      message.author.username + ' looks around for someone to slap with a trout but finds no one.',
      message.author.username + ' barges in swinging a trout but loses their grip and drops it. How embarrassing!!',
    ];

    const hitMessages = [
      message.author.username + ' slaps ' + name + ' with a trout! POW!',
      message.author.username + ' swings a trout and slaps ' + name + ' upside the head!',
      message.author.username + ' slaps ' + name + ' across the face with a trout!',
    ];

    if (name) {
      message.channel.send(client.getRandomItem(hitMessages));
    } else {
      message.channel.send(client.getRandomItem(missMessages));
    }
    message.delete();
  } catch (e) {
    client.logger.error(`Error executing 'trout' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'trout',
  category: 'Fun',
  description: 'Slaps someone with a trout.',
  usage: 'trout <@someone>',
};
