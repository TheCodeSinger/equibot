const Discord = require("discord.js");
const Enmap = require("enmap");

// Create Discord client instance .
const client = new Discord.Client();

// Load the logger.
client.logger = require("./modules/Logger");
client.logger.ready('Logger Initialized');

// Load the auth settings.
client.auth = require("./auth");

// Load the config settings.
client.config = require("./config");

// Load the Utils module.
require("./modules/Utils")(client);

// Load and bind the events.
client.loadEventModules();

// Initialize EnMaps for commands and aliases.
client.commands = new Enmap();
client.aliases = new Enmap();

// Load the commands into memory.
client.loadCommandModules();

// Load a cache of user-friendly permission names.
client.loadPermissions();

// Log the bot into the Discord client.
client.login(client.auth.token);
