/**
 * Direct Message lotto server invite links to users.
 *
 * @example   !servers
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const discord_servers = client.config.params.discord_servers;
    
    // build the body of the message
    let body = '';
    body += discord_servers.join('\n');
    body += '\n\n**Please report any broken or missing invites to `@API Developer`**';
    
    // message the user directly
    message.author.send(body);

    // delete the message
    message.delete();
};
  
exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 'User',
};

exports.help = {
    name: 'servers',
    category: 'Torn',
    description: 'Direct Message lotto server invite links to users.',
    usage: 'servers',
};
