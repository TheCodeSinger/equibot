const CronJob = require('cron').CronJob;
const moment = require("moment");

/**
 * Stocks module. Aside from displaying the daily stock data, primary feature is
 * to set notifications for stock prices.
 *
 * Proposed commands:
 * `stocks` : print list of commands.
 * `stocks list` : list the current stock prices.
 * `stocks watch HRG buy 325` : set a daily watcher to notify when the price falls below $325.
 * `stocks watch HRG sell 325` : set a daily watcher to notify when the price rises above $325.
 * `stocks clear hrg` : Clear a watcher for HRG.
 * `stocks clear all` : Clear all watchers for the member.
 *
 * @example   !stocks
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const config = client.config;
  const memberId = message.author.id;
  const stockExchange = client.tornData.stockExchange;
  const symbolMap = stockExchange.symbols;
  const author = message.author;

  try {
    if (message.channel.type !== 'dm') {
      message.reply('I messaged you privately about this.');
    }

    if (!args.length) {
      // Show the available commands.
      const commandsEmbed = {
        embed: {
          color: config.colors.default,
          title: 'Equilibrium Stock Market Tools',
          description: 'See an output of current stock prices and which stocks you are watching. Set BUY/SELL target prices and be notified when those thresholds are exceeded.',
          fields: [
            {
              name: 'Commands:',
              value: '`' + config.prefix + 'stocks` : Display these instructions.\n' +
                '`' + config.prefix + 'stocks list` : Displays a list of current stock prices. Updated once daily.\n' +
                '`' + config.prefix + 'stocks watch hrg buy 325` : Sets a watcher to notify you when HRG drops to 325.\n' +
                '`' + config.prefix + 'stocks watch hrg sell 450` : Sets a watcher to notify you when HRG rises to 450.\n' +
                '`' + config.prefix + 'stocks clear hrg` : Cancels watcher for symbol HRG.\n' +
                '`' + config.prefix + 'stocks clear all` : Cancels watchers for all stocks.\n'
            }
          ]
        }
      };
      author.send(commandsEmbed);
      return;
    }

    // list the current stock prices.
    if (args[0].toLowerCase() === 'list') {
      const stocks = stockExchange.stocks || {};
      const watcherParams = client.customCronJobs.get('stocks', memberId) || {};
      client.logger.debug(`Number of stocks being watched: ${Object.keys(watcherParams).length}`);

      // Build the message.
      let output = ` Torn City Stock Exchange\n--------------------------\nName       Price  Watching\n--------------------------\n`;
      Object.keys(stocks).forEach(id => {
        const stock = stocks[id];
        const params = watcherParams[id] || [];

        let thresholdText = '';
        if (params[3] === 'sell') {
          thresholdText = `S $${params[2]}`;
        } else if (params[3] === 'buy') {
          thresholdText = `B $${params[2]}`;
        }

        output += `${stock.acronym}${' '.repeat(5 - stock.acronym.length)}${' '.repeat(10 - stock.current_price.length)}$${stock.current_price}  ${thresholdText}\n`;
      });

      output += '\nLegend:\n S $580 = target sell price\n B $260 = target buy price\n';
      output += `\nUpdated Daily: ${moment(stockExchange.updated).format('MMMM D HH:mm:ss')} TCT`;

      author.send(output, {code: 'asciidoc', split: { char: '\u200b' }});
      return;
    }

    // Clear one or all jobs for this user.
    if (args[0].toLowerCase() === 'clear') {
      const stockId = symbolMap[(args[1] || '').toUpperCase()];
      const cronJobWatchers = client.systemCronJobs[memberId] || {};

      if (!args[1]) {
        // Show the available commands.
        return message.reply('You need to specify whether to clear all or a specific symbol.');
      } else if (args[1] === 'all') {
        // Stop all the jobs.
        Object.keys(cronJobWatchers).forEach(function(key) {
          client.logger.debug(`Stopping ${symbolMap[key]}`);
          cronJobWatchers[key].stop();
        });

        // Delete all the jobs.
        client.logger.debug(`Deleting all jobs`);
        client.systemCronJobs[memberId] = undefined;
        client.customCronJobs.remove('stocks', memberId);

        return author.send('Cleared all of your stocks watchers.');
      } else if (stockId) {
        if (!cronJobWatchers[stockId]) {
          return author.send('I was not watching that stock.');
        }

        // Stop the job.
        client.logger.debug(`Stopping ${symbolMap[stockId]}`);
        cronJobWatchers[stockId].stop();

        // Delete the job.
        client.logger.debug(`Deleting ${symbolMap[stockId]}`);
        delete client.systemCronJobs[memberId][stockId];
        client.customCronJobs.delete('stocks', memberId + '[' + stockId + ']');

        return author.send(`Cleared your ${args[1].toUpperCase()} watcher.`);
      } else {
        client.logger.warn(`Unrecognized stock symbol: ${args[1]}`);
        return message.reply('I do not recognize that stock symbol.');
      }
    }

    // Set a watcher.
    if (args[0].toLowerCase() === 'watch') {
      if (!args[1] || !symbolMap[args[1].toUpperCase()]) {
        client.logger.warn(`Unrecognized stock symbol: ${args[1]}`);
        return author.send('I do not recognize that stock symbol.');
      }

      if (!args[2] || !['buy', 'sell'].includes(args[2])) {
        client.logger.warn(`Unrecognized threshold type: ${args[2]}`);
        return author.send('You must specify either a BUY or SELL threshold: "watch sym buy 325"');
      }

      if (!args[3] || isNaN(args[3])) {
        client.logger.warn(`Unrecognized target price: ${args[3]}`);
        return author.send('You must specify a valid target price: "watch sym buy 325"');
      }

      // Stub watcher objects for this user
      client.customCronJobs.ensure('stocks', {}, memberId);
      client.systemCronJobs[memberId] = client.systemCronJobs[memberId] || {};

      // Parse the message.
      const symbol = args[1].toUpperCase();
      const stockId = symbolMap[symbol];
      const targetPrice = args[3];
      const type = args[2].toLowerCase();
      const threshold = type === 'buy' ? 'falls below' : 'rises above';
      const watcher = client.createStockWatcher(memberId, stockId, targetPrice, type);
      watcher.start();

      // Store a reference to the watcher so we can clear it later.
      Object.assign(client.systemCronJobs[memberId], { [stockId]: watcher });

      // Store the params so we can restart the cronjob after a reboot.
      const params = [memberId, stockId, targetPrice, type];
      client.customCronJobs.set('stocks', params, memberId + '[' + stockId + ']');

      author.send(`I will notify you when ${symbol} ${threshold} $${targetPrice}.`);
      return;
    }

    // Unrecognized command.
    client.logger.warn(`Unrecognized command`);
    author.send('I did not understand that command.');

  } catch (e) {
    client.logger.error(`Error executing 'stocks' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'stocks',
  category: 'Torn',
  description: 'Displays stock market commands.',
  usage: 'stocks',
};

/* Sample output of https://api.torn.com/torn/?selections=stocks&key=ZPB0aHohVfEehVVY
{
  "stocks": {
    "0": {
      "name": "Torn City Stock Exchange",
      "acronym": "TCSE",
      "director": "None",
      "current_price": "11253.158",
      "market_cap": 0,
      "total_shares": 0,
      "available_shares": 0,
      "forecast": "Average",
      "demand": "High"
    },
    "1": {
      "name": "Torn City and Shanghai Banking Corporation",
      "acronym": "TSBC",
      "director": "Mr. Gareth Davies",
      "current_price": "498.739",
      "market_cap": 5232979336676,
      "total_shares": 10492420558,
      "available_shares": 2047685469,
      "forecast": "Average",
      "demand": "Average",
      "benefit": {
        "requirement": 4000000,
        "description": "Entitled to receive occasional dividends"
      }
    },
    "2": {
      "name": "Torn City Investment Banking",
      "acronym": "TCB",
      "director": "Mr. Paul Davies",
      "current_price": "552.948",
      "market_cap": 6439895636131,
      "total_shares": 11646476045,
      "available_shares": 2059554823,
      "forecast": "Average",
      "demand": "Average",
      "benefit": {
        "requirement": 1500000,
        "description": "Entitled to receive improved interest rates"
      }
    },
    "3": {
      "name": "Syscore MFG",
      "acronym": "SYS",
      "director": "Mr. Stuart Bridgens",
      "current_price": "513.976",
      "market_cap": 1947269110567,
      "total_shares": 3788638206,
      "available_shares": 83048474,
      "forecast": "Average",
      "demand": "Average",
      "benefit": {
        "requirement": 3000000,
        "description": "Entitled to receive supreme firewall software for you and your company"
      }
    },
    "4": {
      "name": "Society and Legal Authorities Group",
      "acronym": "SLAG",
      "director": "Mr. Samuel Washington",
      "current_price": "197.069",
      "market_cap": 1486774395416,
      "total_shares": 7544435682,
      "available_shares": 0,
      "forecast": "Average",
      "demand": "High",
      "benefit": {
        "requirement": 1500000,
        "description": "Entitled to receive business cards from our lawyers"
      }
    },
    "5": {
      "name": "Insured On Us",
      "acronym": "IOU",
      "director": "Mr. Jordan Blake",
      "current_price": "147.909",
      "market_cap": 2735926261775,
      "total_shares": 18497361633,
      "available_shares": 2983268617,
      "forecast": "Average",
      "demand": "Average",
      "benefit": {
        "requirement": 3000000,
        "description": "Entitled to receive occasional dividends"
      }
    },
    "6": {
      "name": "Grain",
      "acronym": "GRN",
      "director": "Mr. Harry Abbott",
      "current_price": "297.903",
      "market_cap": 1147349405732,
      "total_shares": 3851419441,
      "available_shares": 0,
      "forecast": "Average",
      "demand": "High",
      "benefit": {
        "requirement": 500000,
        "description": "Entitled to receive occasional dividends"
      }
    },
    "7": {
      "name": "Torn City Health Service",
      "acronym": "TCHS",
      "director": "Dr. Rick Lewis",
      "current_price": "356.578",
      "market_cap": 1743259977063,
      "total_shares": 4888860157,
      "available_shares": 889284000,
      "forecast": "Average",
      "demand": "Average",
      "benefit": {
        "requirement": 150000,
        "description": "Entitled to receive occasional medical packs"
      }
    },
    "8": {
      "name": "Yazoo",
      "acronym": "YAZ",
      "director": "Mr. Godfrey Cadberry",
      "current_price": "55.167",
      "market_cap": 2609896123059,
      "total_shares": 47309009427,
      "available_shares": 8716292555,
      "forecast": "Average",
      "demand": "High",
      "benefit": {
        "requirement": 1000000,
        "description": "Entitled to receive free banner advertisement in the local newspaper"
      }
    },
    "9": {
      "name": "The Torn City Times",
      "acronym": "TCT",
      "director": "Mr. Micheal Cassinger",
      "current_price": "261.064",
      "market_cap": 93347842049,
      "total_shares": 357566888,
      "available_shares": 0,
      "forecast": "Average",
      "demand": "High",
      "benefit": {
        "requirement": 125000,
        "description": "Entitled to receive free personal placements in the newspaper"
      }
    },
    "10": {
      "name": "Crude & Co.",
      "acronym": "CNC",
      "director": "Mr. Bruce Hunter",
      "current_price": "526.113",
      "market_cap": 1606168201697,
      "total_shares": 3052895864,
      "available_shares": 146879663,
      "forecast": "Average",
      "demand": "Low",
      "benefit": {
        "requirement": 5000000,
        "description": "Entitled to receive oil rig company sales boost"
      }
    },
    "11": {
      "name": "Messaging Inc.",
      "acronym": "MSG",
      "director": "Mr. Yazukini Chang",
      "current_price": "149.167",
      "market_cap": 307171329552,
      "total_shares": 2059244535,
      "available_shares": 56513046,
      "forecast": "Average",
      "demand": "Average",
      "benefit": {
        "requirement": 300000,
        "description": "Entitled to receive free advertisement placements in the newspaper"
      }
    },
    "12": {
      "name": "TC Music Industries",
      "acronym": "TMI",
      "director": "Mr. Benjamin Palmer",
      "current_price": "202.761",
      "market_cap": 4148746821729,
      "total_shares": 20461266327,
      "available_shares": 0,
      "forecast": "Average",
      "demand": "High",
      "benefit": {
        "requirement": 6000000,
        "description": "Entitled to receive occasional dividends"
      }
    },
    "13": {
      "name": "TC Media Productions",
      "acronym": "TCP",
      "director": "Mr. Richard Button",
      "current_price": "359.318",
      "market_cap": 1510025390302,
      "total_shares": 4202476331,
      "available_shares": 496419832,
      "forecast": "Average",
      "demand": "Average",
      "benefit": {
        "requirement": 1000000,
        "description": "Entitled to receive support for your company (if you are the director) which should result in a 10% bonus to profits"
      }
    },
    "14": {
      "name": "I Industries Ltd.",
      "acronym": "IIL",
      "director": "Mr. Micheal Ibbs",
      "current_price": "97.354",
      "market_cap": 1910901836515,
      "total_shares": 19628385444,
      "available_shares": 0,
      "forecast": "Average",
      "demand": "High",
      "benefit": {
        "requirement": 100000,
        "description": "Entitled to receive software to improve coding time by 50%"
      }
    },
    "15": {
      "name": "Feathery Hotels Group",
      "acronym": "FHG",
      "director": "Mr. Jeremy Hedgemaster",
      "current_price": "422.845",
      "market_cap": 14847699474030,
      "total_shares": 35113811146,
      "available_shares": 5099030698,
      "forecast": "Good",
      "demand": "Average",
      "benefit": {
        "requirement": 2000000,
        "description": "Entitled to receive occasional coupons to stay in our hotels"
      }
    },
    "16": {
      "name": "Symbiotic Ltd.",
      "acronym": "SYM",
      "director": "Dr. Daniel Pieczko",
      "current_price": "400.720",
      "market_cap": 13990295162581,
      "total_shares": 34912894696,
      "available_shares": 0,
      "forecast": "Good",
      "demand": "High",
      "benefit": {
        "requirement": 500000,
        "description": "Entitled to receive occasional drug packs"
      }
    },
    "17": {
      "name": "Lucky Shots Casino",
      "acronym": "LSC",
      "director": "Mr. Martin Wong",
      "current_price": "188.107",
      "market_cap": 1650431612087,
      "total_shares": 8773897899,
      "available_shares": 0,
      "forecast": "Average",
      "demand": "High",
      "benefit": {
        "requirement": 100000,
        "description": "Entitled to receive occasional packs of 100x lottery tickets"
      }
    },
    "18": {
      "name": "Performance Ribaldry Network",
      "acronym": "PRN",
      "director": "Mr. Dylan 'Dick Ironhammer' Tansey",
      "current_price": "717.590",
      "market_cap": 9568119645606,
      "total_shares": 13333685873,
      "available_shares": 86535759,
      "forecast": "Average",
      "demand": "Average",
      "benefit": {
        "requirement": 1500000,
        "description": "Entitled to receive occasional erotic DVDs"
      }
    },
    "19": {
      "name": "Eaglewood Mercenary",
      "acronym": "EWM",
      "director": "Mr. Jamie Frere Smith",
      "current_price": "283.275",
      "market_cap": 1497123857395,
      "total_shares": 5285054655,
      "available_shares": 154290819,
      "forecast": "Average",
      "demand": "Average",
      "benefit": {
        "requirement": 2000000,
        "description": "Entitled to receive occasional grenade packs"
      }
    },
    "20": {
      "name": "Torn City Motors",
      "acronym": "TCM",
      "director": "Mr. George Blanksby",
      "current_price": "296.184",
      "market_cap": 407239533698,
      "total_shares": 1374954534,
      "available_shares": 149813609,
      "forecast": "Average",
      "demand": "Low",
      "benefit": {
        "requirement": 1000000,
        "description": "Entitled to receive a 25% discount when buying car parts"
      }
    },
    "21": {
      "name": "The Empty Lunchbox Building Traders",
      "acronym": "ELBT",
      "director": "Mr. Jack Turner",
      "current_price": "234.463",
      "market_cap": 1275785448482,
      "total_shares": 5441308217,
      "available_shares": 1068260172,
      "forecast": "Poor",
      "demand": "Average",
      "benefit": {
        "requirement": 5000000,
        "description": "Entitled to receive a 10% discount on all home upgrades (not including staff)"
      }
    },
    "22": {
      "name": "Home Retail Group",
      "acronym": "HRG",
      "director": "Mr. Owain Hughes",
      "current_price": "362.816",
      "market_cap": 5680835230983,
      "total_shares": 15657620477,
      "available_shares": 0,
      "forecast": "Average",
      "demand": "High",
      "benefit": {
        "requirement": 1500000,
        "description": "Entitled to receive occasional free properties"
      }
    },
    "23": {
      "name": "Tell Group Plc.",
      "acronym": "TGP",
      "director": "Mr. Jordan Urch",
      "current_price": "79.581",
      "market_cap": 1423091713409,
      "total_shares": 17882304990,
      "available_shares": 0,
      "forecast": "Average",
      "demand": "High",
      "benefit": {
        "requirement": 2500000,
        "description": "Entitled to receive a significant boost in company advertising (if you are the director)"
      }
    },
    "25": {
      "name": "West Side South Bank University",
      "acronym": "WSSB",
      "director": "Mrs. Katherine Hamjoint",
      "current_price": "85.754",
      "market_cap": 2262244647839,
      "total_shares": 26380631199,
      "available_shares": 3104744777,
      "forecast": "Average",
      "demand": "High",
      "benefit": {
        "requirement": 1000000,
        "description": "Entitled to receive a 10% time reduction for all newly started courses"
      }
    },
    "26": {
      "name": "International School TC",
      "acronym": "ISTC",
      "director": "Miss. Mary Huff",
      "current_price": "396.408",
      "market_cap": 255563451127,
      "total_shares": 644698016,
      "available_shares": 0,
      "forecast": "Good",
      "demand": "High",
      "benefit": {
        "requirement": 100000,
        "description": "Entitled to receive free education"
      }
    },
    "27": {
      "name": "Big Al's Gun Shop",
      "acronym": "BAG",
      "director": "Mr. Jim Chapman",
      "current_price": "216.519",
      "market_cap": 1845911931788,
      "total_shares": 8525403922,
      "available_shares": 0,
      "forecast": "Average",
      "demand": "High",
      "benefit": {
        "requirement": 3000000,
        "description": "Entitled to receive occasional special ammunition packs"
      }
    },
    "28": {
      "name": "Evil Ducks Candy Corp",
      "acronym": "EVL",
      "director": "Mr. Adam French",
      "current_price": "279.746",
      "market_cap": 1336034417769,
      "total_shares": 4775883901,
      "available_shares": 62091583,
      "forecast": "Good",
      "demand": "Average",
      "benefit": {
        "requirement": 1750000,
        "description": "Entitled to receive occasional happy boosts"
      }
    },
    "29": {
      "name": "Mc Smoogle Corp",
      "acronym": "MCS",
      "director": "Mr. Gofer Gloop",
      "current_price": "2058.880",
      "market_cap": 12079236228283,
      "total_shares": 5866896676,
      "available_shares": 566939408,
      "forecast": "Average",
      "demand": "Average",
      "benefit": {
        "requirement": 1750000,
        "description": "Entitled to receive occasional free meals"
      }
    },
    "30": {
      "name": "Wind Lines Travel",
      "acronym": "WLT",
      "director": "Sir. Fred Dunce",
      "current_price": "769.834",
      "market_cap": 6689585292888,
      "total_shares": 8689646460,
      "available_shares": 921491628,
      "forecast": "Average",
      "demand": "Average",
      "benefit": {
        "requirement": 9000000,
        "description": "Entitled to receive access to our free private jet"
      }
    },
    "31": {
      "name": "Torn City Clothing",
      "acronym": "TCC",
      "director": "Mrs. Stella Patrick",
      "current_price": "244.368",
      "market_cap": 845537208026,
      "total_shares": 3460097918,
      "available_shares": 0,
      "forecast": "Average",
      "demand": "High",
      "benefit": {
        "requirement": 350000,
        "description": "Entitled to receive occasional dividends"
      }
    }
  }
}
*/
