/**
 * Displays information about the commands recognized by this bot.
 *
 * If no argument is provided, it displays a list of all command names and
 * descriptions.
 *
 * If a command name is provided as an argument, then displays detailed help for
 * the specified command.
 *
 * The list is filtered according to user level and whether requested via direct
 * message or from within a guild.
 *
 * @example   !help
 * @example   !help ping
 */
exports.run = (client, message, args, level) => {
  if (!args[0]) {
    // No command specified, so show a list of all commands available to the
    // user. Filter the list according to whether user has permission and
    // whether requested via direct message or within a guild.
    const myCommands = message.guild ?
      client.commands.filter(cmd => client.levelCache[cmd.conf.permLevel] <= level && !!cmd.help.category && cmd.conf.enabled) :
      client.commands.filter(cmd => client.levelCache[cmd.conf.permLevel] <= level && !!cmd.help.category && cmd.conf.enabled && cmd.conf.guildOnly !== true);

    // Get a list of all the command names and determine the length of the
    // longest one in order to determine a nice width for the command name
    // column.
    const commandNames = myCommands.keyArray();
    const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

    // Build the help message.
    let currentCategory = '';
    let output = `= Command List =\n\n[Use ${client.config.prefix}help <commandname> for details]\n`;
    const sorted = myCommands.array().sort((p, c) => p.help.category > c.help.category ? 1 :  p.help.name > c.help.name && p.help.category === c.help.category ? 1 : -1 );
    sorted.forEach(c => {
      const cat = c.help.category.toUpperCase();
      if (currentCategory !== cat) {
        output += `\u200b\n== ${cat} ==\n`;
        currentCategory = cat;
      }
      output += `${client.config.prefix}${c.help.name}${' '.repeat(longest - c.help.name.length)} :: ${c.help.description}\n`;
    });
    message.channel.send(output, {code: 'asciidoc', split: { char: '\u200b' }});
  } else {
    // Show detailed help for specified command.
    if (client.commands.has(args[0])) {
      const command = client.commands.get(args[0]);

      // Show command only if User has appropriate permission.
      if (level < client.levelCache[command.conf.permLevel]) { return; }

      // Build the help message.
      let text = `= ${command.help.name} = \n${command.help.detailedDescription || command.help.description}\n\nusage:: ${client.config.prefix}${command.help.usage}`;
      if (command.conf.aliases.length) {
        text += `\naliases:: ${command.conf.aliases.join(', ')}`;
      }
      text += `\n= ${command.help.name} =`;
      message.channel.send(text, {code:'asciidoc'});
    } else {
      // Unrecognized command.
      message.channel.send('Unrecognized command: `' + args[0] + '`. Or its usage is above your pay grade.');
    }
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['h'],
  permLevel: 'User'
};

exports.help = {
  name: 'help',
  category: 'System',
  description: 'Displays available commands.',
  detailedDescription: 'Displays all available commands for your permission level.',
  usage: 'help <command>'
};
