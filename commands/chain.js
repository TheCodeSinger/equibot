const CronJob = require('cron').CronJob;

/**
 * TODO:
 *   1. Allow both factions to have chain watchers running
 *   2. Add more granular control to start, pause, resume, stop.
 *      - `!chain start eq2` *
 */

/**
 * Starts the chain watcher which displays chain status every 30 seconds.
 *
 * @example   !chain
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  /**
   * Returns an embed object for displaying chain status.
   *
   * @param   {Object}   chain   Chain object from API.
   * @return  {Object}   Embed object for display chain status.
   */
  function chainEmbed(chain) {
    // Completed chain is in cool down.
    if (chain.cooldown) {
      client.watcher.stop();
      delete client.watcher;
      const title = chain.current === chain.max ? 'Chain completed!' : 'Chain broken';
      return {
        content: `@here ${title}`,
        embed: {
          color: client.config.colors.default,
          author: {
            name: title
          },
          fields: [
            {
              name: 'Completed Hits',
              value: chain.current + ' of ' + chain.max,
              inline: false
            },
            {
              name: 'Ongoing Multiplier',
              value: chain.modifier + 'x',
              inline: false
            },
            {
              name: 'Cooldown Remaining',
              value: client.humanizeSeconds(chain.cooldown),
              inline: false
            }
          ]
        }
      }
    }

    // Active chain.
    if (chain.current) {
      const content = chain.timeout < 45 ? `@here SAVE THE CHAIN: ${chain.timeout}s left!` : undefined;
      return {
        content: content,
        embed: {
          color: client.config.colors.default,
          author: {
            name: 'Chain Active'
          },
          fields: [
            {
              name: 'Current',
              value: chain.current + ' of ' + chain.max,
              inline: true
            },
            {
              name: 'Timeout',
              value: client.humanizeSeconds(chain.timeout),
              inline: true
            },
            {
              name: 'Multiplier',
              value: chain.modifier + 'x',
              inline: true
            },
          ]
        }
      }
    }

    // No chain active.
    client.watcher.stop();
    delete client.watcher;
    return {
      embed: {
        color: client.config.colors.default,
        author: {
          name: 'No Active Chain'
        },
        footer: {
          text: 'You should start one! Announce on chat that you want to start a mini-chain.'
        }
      }
    }
  }

  /**
   * Creates a CronJob to fetch chain info and display status every 30 seconds.
   *
   * @param   {Object}   channel   Discord channel object.
   * @param   {String}  [faction]  Faction nickname.
   * @return  {Object}   CronJob promise to send status message.
   */
  function createChainWatcher(channel, faction) {
    const apiKey = client.auth.factionApiKeys[faction] || client.auth.apiKey;
    const chainApiEndpoint = 'https://api.torn.com/faction/?selections=chain';
    const chainApiLink = chainApiEndpoint + '&key=' + apiKey;

    function fetchChainData() {
      client.logger.log('Fetching chain data');
      fetch(chainApiLink)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            return client.handleApiError(data, channel, chainApiEndpoint);
          }
          client.logger.debug(`Chain data: ${JSON.stringify(data.chain)}`);
          channel.send(chainEmbed(data.chain || {}));
        })
        .catch(error => client.logger.error(JSON.stringify(error)));
    }
    return new CronJob('*/30 * * * * *', fetchChainData);
  }

  // Main
  try {
    if (client.watcher) {
      // Watcher is active.
      if (client.watcher.running) {
        client.watcher.stop();
        client.logger.log('Chain watcher paused');
        message.channel.send('Chain watcher paused.');
      } else {
        client.watcher.start();
        client.logger.log('Chain watcher restarted');
        message.channel.send('Chain watcher restarted.');
      }
    } else {
      // No watcher found. Start one.
      client.watcher = createChainWatcher(message.channel, args[0]);
      client.watcher.start();
      client.logger.log(`Chain watcher started ${args[0] ? 'for ' + args[0] + ' ': ''}in #${message.channel.name} with 30-second interval.`);
      message.channel.send(`Chain watcher started ${args[0] ? 'for ' + args[0] + ' ' : ''}with 30-second interval.`);
    }

  } catch (e) {
    client.logger.error(`Error executing 'chain' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'Bot Support',
};

exports.help = {
  name: 'chain',
  category: 'Faction',
  description: 'Watches chain and displays status.',
  detailedDescription: 'Watches chain and displays status. Typing the command a second time cancels the chain watcher. If you have more than one faction, specify which faction and ensure necessary API Keys in auth.js. If none specified, then it will use the primary API Key.',
  usage: 'chain <faction_name>',
};
