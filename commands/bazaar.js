/**
 * Displays current bazaar prices for a player.
 *
 * @example   !bazaar <torn id>
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars

  /**
   * Returns an embed object for displaying bazaar price list.
   *
   * @param   {Object}   bazaar    Bazaar object from API.
   * @return  {Object}   Embed object for displaying bazaar price list.
   */
  function sendBazaarEmbed(bazaar, channel) {
    const items = [];
    let page = 1;

    /**
     * Send an embed message with a bazaar price list.
     *
     * @param   {Object[]}   items   List of item objects.
     */
    function sendMessage(items) {
      channel.send({
        embed: {
          color: client.config.colors.default,
          author: {
            name: page > 1 ? `Bazaar List, part ${page}` : `Bazaar List`
          },
          fields: items
        }
      });
    }

    // Iterate through list of items and compile the embed objects.
    bazaar.forEach(item => {
      if (items.length > 20) {
        // Too many items for one post. Send this and continue.
        sendMessage(items);

        // Empty the list of items so we can begin filling it again.
        items.length = 0;

        // Increment the page counter.
        page++;
      }

      // Find the matching icon for the item.
      // let icon = client.emojis.cache.find(emoji => emoji.name === 'ti' + item.ID);
      // if (!(icon)) {
      //   // Otherwise, use a generic icon.
      //   icon = ':question:';
      // }

      // Set the list price of the item.
      let price = item.price ? client.formatNumber(item.price) : 'n/a';

      // Set the market price of the item.
      const market = client.formatNumber(item.market_price);

      // Add the embed item object to the list.
      items.push({
        // name: `${icon} ${item.name} x${item.quantity}`,
        name: `${item.name} x${item.quantity}`,
        value: `Price: $${price}  |  Market value: $${market}`,
      });
    });

    sendMessage(items);
  }

  // Main
  try {
    if (args[0] && message.channel.type === 'dm') {
      const bazaarApiEndpoint = `https://api.torn.com/user/${args[0]}?selections=bazaar`;
      const bazaarApiLink = `${bazaarApiEndpoint}&key=${client.auth.apiKey}`;

      client.logger.log(`Fetching bazaar info for ${args[0]}`);

      fetch(bazaarApiLink)
        .then(response => response.json())
        .then(data => {
          // client.logger.debug(`Bazaar API Reponse: ${JSON.stringify(data)}`);
          if (data.error) {
            return client.handleApiError(data, message.channel, bazaarApiEndpoint);
          }

          if (data.bazaar) {
            sendBazaarEmbed(data.bazaar, message.channel);
          } else {
            message.channel.send('This player\s bazaar is empty.');
          }
        })
        .catch(error => {
          client.logger.error(`Catch bazaar api error: ${JSON.stringify(error)}`);
        });

    } else {
      message.channel.send(`DM me with \`${client.config.prefix}bazaar <torn_profile_id>\``);
    }

  } catch (e) {
    client.logger.error(`Error executing 'bazaar' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'bazaar',
  category: 'Trading',
  description: 'Displays a bazaar price list.',
  usage: 'bazaar <torn_profile_id>',
};
