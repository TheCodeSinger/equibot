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
    // user. Filter the list according to user level and whether requested via
    // direct message or within a guild.
    const myCommands = message.guild ? client.commands.filter(cmd => client.levelCache[cmd.conf.permLevel] <= level) :
      client.commands.filter(cmd => client.levelCache[cmd.conf.permLevel] <= level && cmd.conf.guildOnly !== true);

    // Get a list of all the command names and determine the length of the longest one.the Here we have to get the command names only, and we use that array to get the longest name.
    // This make the help commands "aligned" in the output.
    const commandNames = myCommands.keyArray();
    const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

    // Build the help message.
    let currentCategory = "";
    let output = `= Command List =\n\n[Use ${message.settings.prefix}help <commandname> for details]\n`;
    const sorted = myCommands.array().sort((p, c) => p.help.category > c.help.category ? 1 :  p.help.name > c.help.name && p.help.category === c.help.category ? 1 : -1 );
    sorted.forEach( c => {
      const cat = c.help.category.toProperCase();
      if (currentCategory !== cat) {
        output += `\u200b\n== ${cat} ==\n`;
        currentCategory = cat;
      }
      output += `${message.settings.prefix}${c.help.name}${" ".repeat(longest - c.help.name.length)} :: ${c.help.description}\n`;
    });
    message.channel.send(output, {code: "asciidoc", split: { char: "\u200b" }});
  } else {
    // Show detailed help for specified command.
    if (client.commands.has(args[0])) {
      const command = client.commands.get(args[0]);
      if (level < client.levelCache[command.conf.permLevel]) {
        // User lacks permission to use this command. Do not show the detailed help.
        message.channel.send('Unrecognized command: `' + args[0] + '`. Or its usage is above your pay grade.');
        return;
      }

      // Build the help message.
      let text = `= ${command.help.name} = \n${command.help.description}\nusage:: ${command.help.usage}`;
      if (command.conf.aliases.length) {
        text += `\naliases:: ${command.conf.aliases.join(", ")}`;
      }
      text += `\n= ${command.help.name} =`;
      message.channel.send(text, {code:"asciidoc"});
    } else {
      // Unrecognized command.
      message.channel.send('Unrecognized command: `' + args[0] + '`. Or its usage is above your pay grade.');
    }
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["h", "halp"],
  permLevel: "User"
};

exports.help = {
  name: "help",
  category: "System",
  description: "Displays all the available commands for your permission level.",
  usage: "help [command]"
};
