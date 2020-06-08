/**
 * Displays a nice embedded output of a Torn item.
 *
 * @example   !info xanax
 */
 exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (!args[0]) {
      message.channel.send('If you provide the name of an item I will research it for you.');
      return;
    }

    const itemHashById = client.tornData.items;
    const filtered = client.filterItems(itemHashById, args[0]);
    client.logger.debug(`filteredItems: ${JSON.stringify(filtered)}`);
    let itemKeys = Object.keys(filtered);

    /**
     * Returns an embed for display item info.
     *
     * @param   {Object}  item   Item info.
     * @param   {Number}  id     Item ID.
     * @return  {Object}  Embed object for item info.
     */
    function itemInfoEmbed(item, id) {
      client.logger.debug(`selected item: ${JSON.stringify(item)}`);
      return {
        'embed': {
          'color': client.config.colors.default,
          'thumbnail': {
            'url': 'https://alltornup.netlify.com/TornItems965/' + id + '.png'
          },
          'author': {
            'name': item.name + ' #' + id
          },
          'fields': [
            {
              'name': 'Market value',
              'value': '$' + client.formatNumber(item.market_value)
            },
            {
              'name': 'Circulation',
              'value': client.formatNumber(item.circulation),
              'inline': true
            },
            {
              'name': 'Buy price',
              'value': '$' + client.formatNumber(item.buy_price),
              'inline': true
            },
            {
              'name': 'Sell price',
              'value': '$' + client.formatNumber(item.sell_price),
              'inline': true
            },
            {
              'name': 'Description',
              'value': item.description || 'Unknown',
            }
          ]
        }
      };
    }

    if (!itemKeys.length) {
      return message.reply('No item found by that name.');
    }

    if (itemKeys.length > 10) {
      return message.reply('More than 10 items found. Be more precise.');
    }

    if (itemKeys.length > 1) {
      // Found 1-10 matching items. Prompt for a specific one.
      const content = itemKeys.length + ' items found. Type the ID of your intended item.';
      let choices = '';
      itemKeys.forEach(i => choices += '[' + i + '] ' + itemHashById[i].name + '\n');

      return message.reply(content + '```' + choices + '```')
        .then(() => {
          message.channel
            .awaitMessages(response =>
              (response.author.username === message.author.username && itemKeys.includes(response.content)),
              {
                max: 1,
                time: 15000, // 15 seconds
                errors: ['time'],
              }
            )
            .then((collected) => {
              client.logger.debug(`info item reply: ${collected.first().content}`);
              message.channel.send(itemInfoEmbed(itemHashById[collected.first().content], collected.first().content));
            })
            .catch(() => {
              message.reply('Done waiting. You can ask me again if you still need the info.');
            });
        });
    }

    // Exactly one match found. Show it.
    message.channel.send(itemInfoEmbed(itemHashById[itemKeys[0]], itemKeys[0]));

  } catch (e) {
    client.logger.error(`Error executing 'info' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['i'],
  permLevel: 'User'
};

exports.help = {
  name: 'info',
  category: 'Torn',
  description: 'Displays info about a Torn item.',
  usage: 'info <item name>'
};
