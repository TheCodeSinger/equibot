const Discord = require("discord.js");

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

// Load the commands into memory.
client.loadCommandModules();

// Load a cache of user-friendly permission names.
client.loadPermissions();

// Load the member quotes into memory.
client.loadMemberQuotes();

// Load into memory various Torn City data.
client.loadTornData();

// Log the bot into the Discord client.
client.login(client.auth.botToken);
