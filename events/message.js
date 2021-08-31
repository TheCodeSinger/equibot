const config = require("../config");

module.exports = (client, message) => {
  // Ignore all bots, unless you enjoy that sort of thing.
  if (message.author.bot) { return; }

  // Ignore messages not starting with the prefix (in config.json)
  if (message.content.indexOf(client.config.prefix) !== 0) { return; }

  // Ignore messages sent to blacklisted channel ids
  if (client.config.blacklistedChannels.includes(message.channel.id)) { return; }

  // Parse the input into the command and arguments.
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Get the user or member's permission level from the elevation
  const level = client.getPermlevel(message);
  const userLogString = message.author.username + '(Level ' + level + ')';

  // Grab the command data from the client.commands or client.aliases Enmap.
  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

  if (!cmd) {
    // That command doesn't exist. Check for a matching quotable.
    const memberQuote =
      client.quotedMembers.get(command) ||
      client.quotedMembers.get(client.quotedAliases.get(command));

    if (memberQuote) {
      // Found a matching quotable. Run the quote command.
      return client.commands.get('quote').run(client, message, [command], level);
    }

    if (client.config.commandIgnoreList.includes(command)) {
      // Ignore common YATA commands.
      client.logger.cmd(`Ignored command: ${command}`);
      return message.reply(`That may work on other girlbots, but not me. (Try \`?${command}\` instead)`);
    }

    // Unknown command. Reply with a snarky retort.
    function getRetort(cmd) {
      const prefix = client.config.prefix;
      const retorts = [
        `Sorry. I don't know what your mean by \`${prefix}${cmd}\``,
        `Go \`${prefix}${cmd}\` yourself!`,
        `That may work on other girlbots, but not me.`,
      ];

      return client.getRandomItem(retorts);
    }

    // Issue a snarky retort for unrecognized commands.
    return message.reply(getRetort(command));

    // OR Exit silently. Don't make a fuss.
    // return;
  }

  // Ignore commands which are disabled.
  if (!cmd.conf.enabled) {
    return message.reply(`Oops. You stumbled upon a secret command that is not yet enabled. Exciting!`);
  }

  // Rebuke user when attempting to issue a guild-only command directly to the bot.
  if (cmd.conf.guildOnly && !message.guild) {
    return message.reply(`Please don't pester me privately with public commands.`);
  }

  // Log execution of the command.
  const commandLogString = args.length ? command + '(' + JSON.stringify(args) + ')' : command;
  client.logger.cmd(commandLogString + ' ' + userLogString);

  // Run the command
  cmd.run(client, message, args, level);
};
