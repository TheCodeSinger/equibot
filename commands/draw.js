exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const lotto = client.lotto;
    const config = client.config;

    if (!lotto) {
      return message.reply('No active lotto. Why don\'t you start one?');
    }

    if (message.author !== lotto.starter) {
      return message.reply('Nice try, but only the lotto starter can draw the prize.');
    }

    if (!lotto.joins.length) {
      return message.reply(
        'Not so fast! No one has joined the lotto yet. If you are having cold feet you should `' +
        config.prefix + 'cancel` the lotto.');
    }

    if (lotto.winner) {
      return message.reply('The winner for this lotto has already been drawn.');
    }

    if (message.channel !== lotto.channel) {
      return message.reply('Please draw in the channel where the lotto is running.');
    }

    message.delete();

    /**
     * Sleep for specified number of milliseconds.
     *
     * @param   {Number}   ms   Number of milliseconds to sleep.
     * @return  {Object}   A promise to wait a number of milliseconds.
     */
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Display a ten-second countdown before drawing.
    const msg = await message.channel.send({
      'embed': {
        'color': client.config.colors.default,
        'description': 'Drawing in ...',
      }
    });
    let seconds = 10;
     while (seconds > 0) {
      await sleep(1000);
      await msg.edit({
        'embed': {
          'color': client.config.colors.default,
          'description': `Drawing in ${seconds}`,
        }
      });
      seconds--;
    }
    await msg.delete();

    // Draw the winner.
    lotto.winner = client.getRandomItem(lotto.joins);
    let duration = Date.now() - lotto.startTime;

    // Update game stats.
    client.updateGameStats('lotto', 'completed', lotto.starter.id);

    // Decorate user objects with Torn name and profile link.
    client.decorateUser(lotto.winner, message);
    client.decorateUser(lotto.starter, message);

    /**
     * Parses the prize message. Gets value of prize. Updates various records.
     * Assembles and sends prize message.
     *
     * @param   {String}   msg   The prize message posted by the starter. e.g.
     *                           "You sent 10x Xanax to Peterpan."
     */
    function parsePrizeMessage(msg) {
      client.logger.debug(`BEGIN parsePrizeMessage(${JSON.stringify(msg)})`);

      const itemHashById = client.tornData.items;
      let awardValue = 0;
      let itemId;
      let item;

      /**
       * Parse prize message. If cash, then simple. If item, then get value.
       *
       * Possibilites:
       *   You sent $10,000,000 to Peterpan.
       *   You sent a Donator Pack to Peterpan.
       *   You sent an ArmaLite M-15A4 Rifle to Peterpan.
       *   You sent 10x Xanax to Peterpan.
       *   You sent some Xanax to Peterpan. // This means ONE.
       *   You sent 8x Donator Pack to Palleass with the message: You know the deal, now you send 7 back to me"
       */
      const scrubbedMsg = msg.replace(/\s/g, ' ');
      let msgParts = scrubbedMsg.match(/You sent (.*?)( to )(.*)/i);
      if (!msgParts) {
        // Try again in case someone hand wrote the message differently.
        msgParts = msg.match(/You sent (.*)\.?/i);
      }
      client.logger.debug(`msgParts: ${JSON.stringify(msgParts)}`);

      // First part is original message. Second part is the prize "10x Xanax".
      let prizeParts = msgParts[1].split(' ');
      client.logger.debug(`prizeParts: ${JSON.stringify(prizeParts)}`);

      // Either a cash value amount or a quantity of goods.
      let quantity = prizeParts.shift();
      client.logger.debug(`quantity: ${JSON.stringify(quantity)}`);

      // Either undefined, if cash prize, or the actual goods.
      let prize = prizeParts.join(' ');
      client.logger.debug(`prize: ${JSON.stringify(prize)}`);

      if (!prize) {
        // Prize was cash. Convert currency string to a number.
        awardValue = Number(quantity.replace(/[^0-9.-]+/g,""));
      } else {
        // Prize was goods. Parse the quantity and actual goods.

        // parse out any irregular units.
        if (prize.startsWith('pair of ')) {
          prize = prize.slice(8);
        }
        client.logger.debug(`updated prize: ${JSON.stringify(prize)}`);

        // Convert some non-numeric values to numbers
        if (['some', 'a', 'an'].includes(quantity)) {
          quantity = 1;
        } else if (quantity.includes('x')) {
          // Strip the 'x' from '10x'.
          quantity = quantity.slice(0, -1);
        }

        // Get market value of prize and multiply by quantity.
        const filteredItems = client.filterItems(itemHashById, prize, true);
        client.logger.debug(`filteredItems: ${JSON.stringify(filteredItems)}`);

        // Should be an exact match if lotto host pasted in the actual sent item
        // message.
        const filteredItemKeys = Object.keys(filteredItems);
        if (!filteredItemKeys.length) {
          // No matching item was found which suggests the host did not paste
          // in the proper "You sent..." message. We have to abort and warn the
          // host.
          client.logger.error(`Host sent a prize message with an ambiguous item name. Cannot record the prize.`);
          lotto.channel.send(`Sorry ${lotto.starter.toString()}, but I couldn't find a matching item by that name. Next time paste in the precise 'You sent...' message after sending the prize to the winner. For example: "You sent 10x Xanax to PeterPan with the message: You can fly!"`);
          itemId = 0;
          item = {};
        } else {
          // All is well. Assign known values.
          itemId = filteredItemKeys[0];
          item = itemHashById[itemId];
          awardValue = item.market_value * quantity;
          client.logger.debug(`awardValue: ${JSON.stringify(awardValue)}`);
        }
      }

      // Update game stats for the host.
      client.ensureMemberStats(lotto.starter.id);
      client.updateGameStats('lotto', 'awarded', lotto.starter.id, awardValue);
      const hostStats = client.games.get(lotto.starter.id);

      // Update game stats for the winner.
      client.ensureMemberStats(lotto.winner.id);
      client.updateGameStats('lotto', 'won', lotto.winner.id, awardValue);

      // Update game records.
      client.updateGameRecords('lotto', lotto.joins.length, awardValue, duration);

      // Prize message embed.
      const prizeMessageEmbed = {
        embed: {
          color: client.config.colors.default,
          thumbnail: {
            url: 'http://torneq.com/assets/icon-cash.png',
          },
          author: {
            name: `Thank you to ${lotto.starter.tornName} for the lotto.`,
          },
          description: awardValue ? `Total value of the prize: ${client.formatCurrency(awardValue)}` : undefined,
          fields: [
            {
              name: 'Host Stats',
              value: `Number of Lottos Hosted: ${hostStats.lotto.completed}\nValue of Prizes Awarded: ${client.formatCurrency(hostStats.lotto.valueAwarded)}`
            }
          ],
          footer: {
            text: 'Prize has been recorded. This lotto is now closed.',
          }
        }
      };

      // If the prize was goods, then add additional info to the embed.
      if (prize) {
        prizeMessageEmbed.embed.thumbnail.url = 'https://alltornup.netlify.com/TornItems965/' + itemId + '.png';
      }

      // But only if an actual prize was identified.
      if (prize && item.name) {
        prizeMessageEmbed.embed.title = `${quantity}x ${prize}`;
        prizeMessageEmbed.embed.fields.unshift({
          name: 'Item Info',
          value: `Name: ${item.name}\nCirculation: ${client.formatNumber(item.circulation)}\nMarket Value: ${client.formatCurrency(item.market_value)}\nDescription: ${item.description || 'Unknown'}`
        });
      }

      lotto.channel.send(prizeMessageEmbed);

      // Must use the original reference when setting null.
      client.lotto = null;
    }

    // Win message embed.
    const output = {
      content: ':tada: ' + lotto.winner.toString() + ' :tada:',
      embed: {
        color: config.colors.default,
        fields: [
          {
            name: 'The winner is revealed!',
            value: lotto.winner.tornName + ' won **' + lotto.prize + '** from ' + lotto.starter.tornName + '.'
          },
          {
            name: 'Link to winner\'s profile:',
            value: '[' + lotto.winner.discordName + '](' + lotto.winner.tornLink + ')',
          },
          {
            name: 'Link to your items page:',
            value: '[https://www.torn.com/item.php](https://www.torn.com/item.php)\n' +
              'Please copy the sent message in the next 5 minutes to close the lotto.'
          },
          {
            name: 'Show your love:',
            value: '`' + config.prefix + 'gg` - Congratulate the winner\n `' + config.prefix + 'ty` - Thank the host'
          }
        ]
      }
    };
    message.channel.send(output).then(() => {
      message.channel
        .awaitMessages(response => (response.author === message.author && response.content.toLowerCase().startsWith('you sent')),
          {
            max: 1,
            time: 300000,
            errors: ['time'],
          }
        )
        .then((collected) => {
          // Parse the "You sent..." Prize message and send announcement.
          parsePrizeMessage(collected.first().content);
        })
        .catch((error) => {
          client.logger.error(`Error confirming 'draw' command: ${error}`);
          lotto.channel.send('Lotto for **' + lotto.prize +  '** is now closed. ' + lotto.starter.toString() +
            ', did you send the prize to ' + lotto.winner.toString() + '?');

            // Must use the original reference when setting null.
          client.lotto = null;
        });
    });

  } catch (e) {
    client.logger.error(`Error executing 'draw' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'draw',
};
