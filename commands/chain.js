const CronJob = require('cron').CronJob;

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
    if (chain.cooldowm) {
      return {
        embed: {
          color: client.config.colors.default,
          author: {
            name: 'Chain Completed'
          },
          fields: [
            {
              name: 'Chain Hits',
              value: chain.current,
              inline: false
            },
            {
              name: 'Multiplier',
              value: chain.modifier + 'x',
              inline: false
            },
            {
              name: 'Cooldown',
              value: chain.cooldown + 's',
              inline: false
            }
          ]
        }
      }
    }

    // Active chain.
    if (chain.current) {
      return {
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
              value: chain.timeout + 's',
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
   * @return  {Object}   CronJob promise to send status message.
   */
  function createChainWatcher(channel) {
    const chainApiEndpoint = 'https://api.torn.com/faction/?selections=chain';
    const chainApiLink = chainApiEndpoint + '&key=' + client.auth.apiKey;

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
        .catch(error => client.logger.log(JSON.stringify(error)));
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
      client.watcher = createChainWatcher(message.channel);
      client.watcher.start();
      client.logger.log(`Chain watcher started in #${message.channel.name} with 30-second interval.`);
      message.channel.send('Chain watcher started with 30-second interval.');
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
  detailedDescription: 'Watches chain and displays status. Typing the command a second time cancels the chain watcher.',
  usage: 'chain',
};
