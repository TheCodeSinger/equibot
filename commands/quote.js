const moment = require("moment");

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const specifiedName = (args[0] || '').toLowerCase();
    let member;

    if (specifiedName) {
      // Find a matching member from the list of names or aliases.
      // TODO: (Use fuzzy match)
      member =
        client.quotedMembers.get(specifiedName) ||
        client.quotedMembers.get(client.quotedAliases.get(specifiedName));
    } else {
      // No member specified. Select a random member from those who are quoted.
      member = client.quotedMembers.get(client.getRandomItem(client.listOfQuotedMembers));
    }

    if (!member) {
      // No match found.
      message.reply(`Apparently \`${specifiedName}\` has not said anything quotable.`);
      return;
    }

    const embed = {
      embed: {
        color: client.config.color,
        author: {
          name: !member.title ? member.name : undefined,
        },
        title: member.title,
        description: client.getRandomItem(member.quotes),
      }
    };
    message.channel.send(embed);
  } catch (e) {
    client.logger.error(`Error executing 'quote' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'quote',
  category: 'Faction',
  description: 'Displays a perfectly apropos quote.',
  detailedDescription: 'Displays a random quote by or about a specified member.\n\nIf no member specified, then selects a perfectly apropos quote for the moment.\n\nYou may also omit the `!quote` and directly use the member name (or nickname) as the command. e.g. `!peterpan` or `!pan`.',
  usage: 'quote [member name]',
};
