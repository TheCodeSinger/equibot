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
  if (!args.length) {
    return message.reply('Use the format `!chain start eq1`');
  }

  const action = (args[0]).toLowerCase() || '';
  const faction = (args[1] || 'eq1').toLowerCase() || '';

  // Fall back to @here so still works if a new faction hasn't been properly set up.
  const factionRoleId = client.config.factionRoleNames[faction] || 'here';
  const factionDisplayName = client.config.factionList[faction] || '';

  const apiKey = client.auth.factionApiKeys[faction] || client.auth.apiKey;
  const chainApiEndpoint = 'https://api.torn.com/faction/?selections=chain';
  const chainApiLink = chainApiEndpoint + '&key=' + apiKey;

  /**
   * Returns an embed object for displaying chain status.
   *
   * @param   {Object}   chain   Chain object from API.
   * @return  {Object}   Embed object for display chain status.
   */
  function chainEmbed(chain, faction) {
    // Completed chain is in cool down.
    if (chain.cooldown) {
      client.chain[faction].stop();
      delete client.chain[faction];
      const milestones = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
      const completed = milestones.includes(chain.current);
      const title = completed ? `${factionDisplayName} Chain Completed!` : `${factionDisplayName} Chain Broken!`;
      return {
        content: `<@&${factionRoleId}> ${title}`,
        embed: {
          color: client.config.colors.default,
          author: {
            name: title
          },
          fields: [
            {
              name: 'Completed Hits',
              value: chain.current + (completed ? '' : ' of ' + chain.max),
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
      let content = '';
      switch(true) {
        case chain.timeout <= 60:
          content = `<@&${factionRoleId}> SAVE THE CHAIN: ${chain.timeout}s left!`;
          break;

        case chain.timeout <= 90:
          content = `<@&${factionRoleId}> SAVE THE CHAIN: ${chain.timeout}s left!`;
          break;

        default:
          content = `${factionDisplayName} Chain Status`;
      }

      return {
        content: content,
        embed: {
          color: client.config.colors.default,
          author: {
            name: `${factionDisplayName} Chain Active`
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
    client.chain[faction].stop();
    delete client.chain[faction];
    return {
      embed: {
        color: client.config.colors.default,
        author: {
          name: `No Active Chain for ${factionDisplayName}`
        },
        footer: {
          text: 'You should start one! Announce on chat that you want to start a mini-chain.'
        }
      }
    }
  }

  /**
   * Fetches chain data and posts a message.
   */
  function fetchChainData(printStatus) {
    client.logger.log('Fetching chain data');
    fetch(chainApiLink)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          return client.handleApiError(data, message.channel, chainApiEndpoint);
        }
        client.logger.debug(`Chain data: ${JSON.stringify(data.chain)}`);

        // Display a message if the chain is no longer active or if it is
        // active with fewer than 2 minutes on the timer.
        if (printStatus || !data.chain.current || data.chain.timeout < 120) {
          message.channel.send(chainEmbed(data.chain || {}, faction));
        }
      })
      .catch(error => client.logger.error(JSON.stringify(error)));
  }

  // Main
  try {
    if (!['eq1', 'eq2', 'eq3', 'eq4'].includes(faction)) {
      return message.channel.send(`You must specify which faction to watch: eq1, eq2, etc.`);
    }

    if (action === 'stop') {
      if (!client.chain[faction]) {
        // No active chain watcher.
        return message.channel.send(`No active chain watcher. You're good.`);
      }

      // Watcher is active. Cancel it.
      client.chain[faction].stop();
      delete client.chain[faction];
      client.logger.log(`Stopped chain watcher for ${factionDisplayName}`);
      return message.channel.send(`Stopped chain watcher for ${factionDisplayName}`);
    }

    if (action === 'start') {
      if (client.chain[faction]) {
        // Watcher is already running.
        return message.channel.send(`Already watching the chain. You're good.`);
      }

      // No watcher found. Start one.
      client.chain[faction] = new CronJob('*/30 * * * * *', fetchChainData);;
      client.chain[faction].start();
      const channelName = message.channel.name;
      client.logger.log(`Chain watcher started for ${factionDisplayName} ${channelName ? 'in #' + channelName : ''}`);
      return message.channel.send(`Chain watcher started for ${factionDisplayName}`);
    }

    if (action === 'status') {
      if (!client.chain[faction]) {
        return message.channel.send(`No active chain watcher.`);
      }

      return fetchChainData(true);
    }

    // Command not recognized.
    return message.channel.send('Use the format `!chain start eq1`. Check `!help chain` for more info.');

  } catch (e) {
    client.logger.error(`Error executing 'chain' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'chain',
  category: 'Faction',
  description: 'Watches chain and displays status.',
  detailedDescription: 'Watches chain and displays status whenever the timer drops below two minutes.',
  usage: 'chain start|stop|status eq1|eq2|eq3',
};
