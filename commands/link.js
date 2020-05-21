/**
 * Displays a clickable link to the Torn profile for the specified member.
 *
 * @example   !link @Aarlo
 */
 exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const guildMember = message.guild.member(message.mentions.users.first() || message.author);
  if (!guildMember) {
    message.channel.send('Use a proper tagged Discord name.');
    return;
  }

  const displayName = guildMember.displayName;
  const id = client.getTornId(displayName);
  const name = client.getTornName(displayName);

  if (id) {
    message.channel.send('Torn profile for **' + name + '**: https://www.torn.com/profiles.php?XID=' + id);
  } else {
    message.channel.send('Cannot find a Torn ID in member name: *' + displayName + '*.');
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'User'
};

exports.help = {
  name: 'link',
  category: 'Faction',
  description: 'Displays link to a Torn profile.',
  usage: 'link <@discord name>'
};
