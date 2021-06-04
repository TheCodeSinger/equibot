exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const author = client.decorateUser(message.author, message).tornName;
    const mentioned = message.mentions.members.first();
    const name = mentioned ? mentioned.toString() : args[0];

    const errorMessages = [
      author + ' looks around for ' + name + ' to slap with a trout but finds no one by that name.',
      author + ' looks around for ' + name + ' to slap with a trout but they must have slipped away.',
    ];

    const missMessages = [
      author + ' swings a trout wildly but hits nobody!',
      author + ' barges in swinging a trout wildly and slaps himself in the face!',
      author + ' charges at ' + name + ', swinging a trout, but loses their grip and drops it. How embarrassing!!',
    ];

    const hitMessages = [
      author + ' slaps ' + name + ' with a trout! POW!',
      author + ' swings a trout and slaps ' + name + ' upside the head!',
      author + ' slaps ' + name + ' across the face with a trout!',
      author + ' slaps ' + name + ' in the gut with a trout! LOW BLOW!',
      author + ' caps ' + name + ' across the knees with a trout!',
      'With a two-handed grip, ' + author + ' wallops ' + name + ' across the back of the head with a trout!',
    ];

    if (mentioned) {
      const random = Math.floor(Math.random() * 9) + 1;
      const msg = random === 1 ? client.getRandomItem(missMessages) : client.getRandomItem(hitMessages);
      message.channel.send(msg);
    } else {
      message.channel.send(client.getRandomItem(errorMessages));
    }
    // message.delete();
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
