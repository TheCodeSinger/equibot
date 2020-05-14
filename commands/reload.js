exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (!args || args.length < 1) {
      return message.reply('Must provide a command to reload.');
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