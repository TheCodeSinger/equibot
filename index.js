// Check for minimum required Node version or throw error.
if (Number(process.version.slice(1).split(".")[0]) < 8) throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");

// Load the discord.js library.
const Discord = require("discord.js");

// Load everythings else.
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");

// This is the bot client. Everything is attached to the `client`.
const client = new Discord.Client();

// Load the auth info, including the bot's secret token: `client.auth.token`.
client.auth = require("./auth.js");

// Load the config info, including the message prefix: `client.config.prefix`.
client.config = require("./config.js");

// Load the logger.
client.logger = require("./modules/Logger");

// Load the util functions module.
require("./modules/functions.js")(client);

// Create collections for all commands and aliases.
client.commands = new Enmap();
client.aliases = new Enmap();

// Store the settings in an EnMap.
client.settings = new Enmap({name: "settings"});

const init = async () => {
  // Load each command into memory.
  const cmdFiles = await readdir("./commands/");
  client.logger.log(`Loading a total of ${cmdFiles.length} commands.`);
  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    const response = client.loadCommand(f);
    if (response) console.log(response);
  });

  // Load each event, including ready and message.
  const evtFiles = await readdir("./events/");
  client.logger.log(`Loading a total of ${evtFiles.length} events.`);
  evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    client.logger.log(`Loading Event: ${eventName}`);
    const event = require(`./events/${file}`);

    // Send the `client` as the first arg for each event.
    client.on(eventName, event.bind(null, client));
  });

  // Generate a cache of client permissions for use in commands.
  client.levelCache = {};
  for (let i = 0; i < client.config.permLevels.length; i++) {
    const thisLevel = client.config.permLevels[i];
    client.levelCache[thisLevel.name] = thisLevel.level;
  }

  // Login the client.
  client.login(client.auth.token);
};

init();
