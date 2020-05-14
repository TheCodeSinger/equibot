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

    const itemHashById = client.tornData.itemHashById;

    function itemInfo(item, id) {
      return {
        'embed': {
          'color': client.config.color,
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
              'value': item.description
            }
          ]
        }
      };
    }

    const filtered = client.filterItems(itemHashById, args[0]);

    let itemKeys = Object.keys(filtered);
    if (itemKeys.length === 0) {
      message.channel.send('No item found by that name.');
    } else if (itemKeys.length > 10) {
      message.channel.send('More than 10 items found. Be more precise.');
    } else if (itemKeys.length > 1) {
      const content = itemKeys.length + ' items found. Type the ID of your intended item.';
      let choices = '';
      itemKeys.forEach(i => choices += '[' + i + '] ' + itemHashById[i].name + '\n');
      message.channel.send(content + '```' + choices + '```')
        .then(() => {
          message.channel.awaitMessages(response =>
            (response.author.username === message.author.username && itemKeys.includes(response.content)),
            {
            max: 1,
            time: 15000,
            errors: ['time'],
          })
            .then((collected) => {
              message.channel.send(itemInfo(itemHashById[collected.first().content], collected.first().content));
            })
            .catch(() => {
              message.channel.send('Done waiting. You can ask me again if you still need the info.');
            });
        });
    } else {
      message.channel.send(itemInfo(itemHashById[itemKeys[0]], itemKeys[0]));
    }

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
  category: 'Faction',
  description: 'Displays info about a Torn item.',
  usage: 'info <item name>'
};
