/**
 * Displays Fire Trader's price for an item.
 *
 * @example   !firetrading <item name>
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const itemList = client.tornData.itemHashById;
  const lordofFire = client.quotedMembers.get('lordoffire');

  /**
   * Returns an embed object with Fire Trader's pricing for an item.
   *
   * @param   {Object}   item   The Torn item object.
   * @param   {String}   id     The Torn item ID.
   * @return  {Object}   A Discord embed object.
   */
  function embedFireTrading(item, id) {
    return {
      'embed': {
        'color': client.config.colors.lof,
        'title': 'LordofFire\'s price:',
        'description': '[Start Trade](https://www.torn.com/trade.php#step=start&userID=2411517/) ' +
          '| [Pricelist](https://tinyurl.com/fire-trading-pricelist/)',
        'thumbnail': {
          'url': 'https://alltornup.netlify.com/TornItems965/' + id + '.png'
        },
        'author': {
          'name': item.name + ' #' + id
        },
        'image': {
          'url': 'https://arsonwarehouse.com/!/lordoffire/bids/' + id + '@2x.png'
        },
        'footer': {
          'text': 'Fire Trading'
        }
      }
    };
  }

  try {
    if (!args[0]) {
      // No item specified. Display a random LoF quote.
      return message.channel.send({
        embed: {
          color: client.config.colors.default,
          author: {
            name: 'Fire Trading',
            url: 'https://tinyurl.com/firetrading/',
          },
          description: client.getRandomItem(lordofFire.quotes),
        }
      });
    }

    let filtered = client.filterItems(itemList, args[0]);
    let itemKeys = Object.keys(filtered);

    if (!itemKeys.length) {
      return message.reply('No item found!');
    }

    if (itemKeys.length > 9) {
      return message.reply('More than 9 items found. Be more precise, please!');
    }

    if (itemKeys.length > 1) {
      const content = itemKeys.length + ' items found. Choose by answering with the displayed number!';
      let choices = '';
      itemKeys.forEach(id => choices += '[' + id + '] ' + itemList[id].name + '\n');

      return message.reply(content + '```' + choices + '```')
        .then(() => {
          message.channel
            .awaitMessages(response =>
              (response.author.username === message.author.username && itemKeys.includes(response.content)),
              {
                max: 1,
                time: 10000, // 10 seconds
                errors: ['time'],
              }
            )
            .then((collected) => {
              const selectedId = collected.first().content;
              message.channel.send(embedFireTrading(itemList[selectedId], selectedId));
            })
            .catch(() => {
              message.reply('Done waiting. You can ask me again if you still need the info.');
            });
        });
    }

    // Exactly one match found. Show it.
    message.channel.send(embedFireTrading(itemList[itemKeys[0]], itemKeys[0]));

  } catch (e) {
    client.logger.error(`Error executing 'firetrading' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['ft', 'fire'],
  permLevel: 'User',
};

exports.help = {
  name: 'firetrade',
  category: 'Trading',
  description: 'Displays a Fire Trader price.',
  usage: 'firetrade <item name>',
};
