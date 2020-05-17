const chalk = require("chalk");

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    await message.reply("I am rebooting and should be back online within 5 seconds.");
    await Promise.all(client.commands.map(cmd => client.unloadCommand(cmd.help.name))).then(() => {
      client.logger.log(`Unloaded a total of ${chalk.bgGreen(client.commands.size)} commands.`);
    });
    process.exit(0);
  } catch (e) {
    client.logger.error(`Error executing 'reboot' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "Bot Admin"
};

exports.help = {
  name: "reboot",
  category: "System",
  description: "Shuts down the bot.",
  detailedDescription: "Shuts down the bot. If running under PM2, bot will restart automatically.",
  usage: "reboot"
};
