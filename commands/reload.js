/**
 * Reloads the specified module. This allows you to maintain uptime when
 * patching the bot.
 *
 * NOTE: The reload command does not work for new commands. The bot
 * will have to be rebooted to pick up new commands.
 *
 * TODO: Add ability to do a new `loadCommands` command in order to pickup new
 * command modules.
 *
 * @example   !reload lotto
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (!args || args.length < 1) {
      return message.reply('Must provide a command to reload.');
    }

    // Catch a few special cases which are not command modules.
    if (args[0] === 'quotes') {
      // Clear the existing quotes cache.
      client.quotedMembers = null;
      client.quotedAliases = null;

      // Reload the quotes.json file.
      client.loadMemberQuotes();
      return message.reply('The quotes file has been reloaded.');
    }

    const command = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));
    if (!command) {
      message.reply(`No command by the name or alias \`${args[0]}\` is loaded at this time.`);
      return;
    }

    const commandName = command.help.name;
    if (!await client.unloadCommand(commandName)) { return; }
    if (!client.loadCommand(commandName)) { return; }

    message.reply(`The command \`${commandName}\` has been reloaded.`);
  } catch (e) {
    client.logger.error(`Error executing 'reload' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'Bot Admin'
};

exports.help = {
  name: 'reload',
  category: 'System',
  description: 'Reloads a command module.',
  usage: 'reload <command>'
};
