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
  const guildMember = message.guild.member(message.mentions.users.first());
  if (!guildMember) {
    message.channel.send('Use a proper tagged Discord name.');
    return;
  }

  /**
   * Parses the parts of a member's Discord name.
   *
   * @param   {String}   name    A Discord member name.
   * @return  {Array[]}  The three string parts of a Discord name.
   */
  function getNameParts(name) {
    if (!name) {
      client.logger.error('Null `name` arg provided to `getNameParts(name)`');
      return ['unknownName [unknownId]', 'unknownName', '[unknownId]'];
    }

    // Parses the name into parts: ['Aarlo [2252482]', 'Aarlo', '[2252482]']
    return name.match(/(.*) \[(\d*)\]/) || '[unknownId]';
  }

  /**
   * Parses the parts of a member's Discord name.
   *
   * @param   {String}   name    A Discord member name.
   * @return  {String}   The Torn name for the Discord User.
   */
  function getTornName(name) {
    if (!name) {
      client.logger.error('Null `name` arg provided to `getTornName(name)`');
      return 'unknownName';
    }
    return getNameParts(name)[1];
  }

  /**
   * Parses the parts of a member's Discord name.
   *
   * @param   {String}   name    A Discord member name.
   * @return  {String}   The Torn ID for the Discord User.
   */
  function getTornId(name) {
    if (!name) {
      client.logger.error('Null `name` arg provided to `getTornId(name)`');
      return 'unknownId';
    }
    return getNameParts(name)[2];
  }

  const displayName = guildMember.displayName;
  const id = getTornId(displayName);
  const name = getTornName(displayName);

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
  category: 'Torn API',
  description: 'Displays a clickable link to a Torn profile.',
  usage: 'link <@discord name>'
};
