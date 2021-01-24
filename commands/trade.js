const https = require("https")
const async = require('async');

/**
 * Displays item buy prices for EQ traders.
 *
 * @example   !tr[ade] <item name>
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let item_list_cache = client.tornData.items;
  const traders = client.config.params.trade.traders;
  const price_url = client.config.params.trade.price_url;

  // add some fake items that exist on tornexchange.com but not in-game.
  // this is not added to client.tornData.items directly as they are
  // not real in-game items and do not have real ids.
  item_list_cache['FAKE1'] = { 'name' : 'Plushie Set' };
  item_list_cache['FAKE2'] = { 'name' : 'Flower Set' };

  var trader_urls = [];
  Object.keys(traders).forEach(trader => {
    trader_urls.push(`${price_url}/${trader}`)
  })

  // process !tr requests where the normalized item name is found
  async function process(item_name) {
    var formatted_desc = ''

    // process each trader_urls as a promise to get the api response
    const results = await Promise.all(trader_urls.map((url) => fetch(url).then((r) => r.json()))).catch((error) => {});
    if(results == undefined) {
      // if the promise fails (most commonly an api error, note it and move stop processing
      return message.channel.send({
        embed: {
          description : 'API returned an unexpected error. Try again in a few minutes.',
        }
      });
    }

    results.some(result => {
      // an error response is expected if the endpoint is unable to build the proper payload
      if('error' in result) {
        message.channel.send({
          embed : {
            description : 'API returned an expected error. Try again in a few minutes.',
          }
        });
        return true
      }
      
      trader = Object.keys(result)[0]
      items = result[trader];
      if (item_name in items) {
          item = items[item_name];

          let price = item['price'];
          let trade_url = traders[trader]['trade_url'];
          let price_url = traders[trader]['price_url'];
          let forum_url = traders[trader]['forum_url'];

          formatted_desc += `
          **${trader}: ${price}**
          [Start Trade](${trade_url}) | [Pricelist](${price_url}) | [Forum](${forum_url})
          `;
        }
    });

    if (formatted_desc != '') {
      message.channel.send({
        embed: {
          title: `**Prices for ${item_name}:**`,
          description: formatted_desc,
          thumbnail: {
            url: item['img']
          },
          footer: {
            text: 'Please upvote your trader on the Pricelist and Forums'
          }
        }
      });
    } else {
      message.channel.send({
        embed: {
          description: `No faction traders are currently buying "${item_name}".`
        }
      });
    }
  }

  // !tr help
  if(args.length == 0 || (args.length == 1 && args[0] == 'help')) {
    return message.channel.send({
      embed: {
        description: `
          Usage: \`!tr <Item Name>\`\n
          Examples:
          \`!tr Xanax\`
          \`!tr Big Box of Chocolate Bars\`
        `
      }
    });
  }

  // !tr <Item Name>
  let found_match = false;
  let partial_matches = [];
  let item_name = args.join(' ');
  Object.keys(item_list_cache).some(function(item_id, index) {
    let normalized_item_name = item_list_cache[item_id]['name']

    // if an exact match is found
    // e.g. `!tr xanax`
    if(item_name.toUpperCase() == normalized_item_name.toUpperCase()) {
      found_match = true
      process(normalized_item_name)
      return true
    }

    // keep track of partial matches
    if(normalized_item_name.toUpperCase().includes(item_name.toUpperCase())) {
      partial_matches.push(normalized_item_name);
    }
  });

  // if a single partial match is found
  // e.g. `!tr xan`
  if(!found_match && partial_matches.length == 1) {
    found_match = true;
    message.channel.send({
      embed: {
        description: `
          Partial matches found for "${item_name}, assuming the following:
          \`!tr ${partial_matches[0]}\`
          `
      }
    })
    process(partial_matches[0])
  }

  // if one or more partial matches are found
  // e.g. `!tr ford`
  if(!found_match && partial_matches.length > 1) {
    found_match = true;
    let matches_string = '';
    partial_matches.forEach(match => {
      matches_string += `\`!tr ${match}\`\n`
    });

    return message.channel.send({
      embed: {
        description: `
          Partial matches found for "${item_name}", use one of the below commands:
          ${matches_string}
          `
      }
    })
  }

  // default case if an exact or partial match cannot be found
  // e.g. `!tr fake item`
  if(!found_match) {
    return message.channel.send({
      embed: {
        description: `Could not find partial or exact match for "${item_name}". Please check your spelling and try again.`
      }
    });
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['tr', 'trade'],
  permLevel: 'User',
};

exports.help = {
  name: 'trade',
  category: 'Torn',
  description: 'Displays EQ Trader prices.',
  usage: 'tr[ade] <item name>',
};
