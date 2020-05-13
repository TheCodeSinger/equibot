module.exports = async client => {
  try {
    // Log that the bot is online.
    const output = client.user.tag + ' is ready to serve ' +
      client.users.cache.size + ' users in ' +
      client.channels.cache.size + ' channels on ' +
      client.guilds.cache.size + ' servers.';
    client.logger.ready(output, 'ready');
  } catch (e) {
    client.logger.error(`Error executing 'ready' event: ${e}`);
  }
};
