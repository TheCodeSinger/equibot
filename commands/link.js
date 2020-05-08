/**
 * Displays a clickable link to the Torn profile for the specified member.
 *
 * @example   !link @Aarlo
 */
 exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  if (!args[0]) {
    message.channel.send('If you provide a username then I will give you their Torn profile link.');
    return;
  }
  const displayName = message.guild.member(message.mentions.users.first()).displayName;
  const id = client.getTornId(displayName);
  const name = client.getTornName(displayName);

  if (id) {
    message.delete();
    message.channel.send('Torn profile for **' + name + '**: https://www.torn.com/profiles.php?XID=' + id);
  } else {
    message.channel.send('Cannot find a Torn ID in member name: *' + displayName + '*.');
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "User"
};

exports.help = {
  name: "link",
  category: "Torn API",
  description: "Display a clickable link to someone's Torn profile.",
  usage: "link <@discord name>"
};
