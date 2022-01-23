const moment = require("moment");

/**
 * Starts a lotto game which is a free raffle/drawing. Other members can `!join`
 * and the host can `!draw` when ready.
 *
 * The command expects an argument which is the prize to be given away. If no
 * argument provided, the command will display info about the current lotto.
 *
 * Commands for:
 *   Hosts: !lotto, !lastcall, !draw, !cancel
 *   Participants: !join, !goodgame, !thankyou
 *   Everyone: !lottoinfo, !roast
 *
 * @example   !lotto 10 Xanax
 * @example   !lotto
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    let lotto = client.lotto;
    const config = client.config;

    if (lotto) {
      // Already a game of lotto running.
      if (args[0]) {
        return message.reply('There is already a lotto running. Please wait for this one to be completed.');
      }

      // Display the lotto info.
      client.decorateUser(lotto.starter, message);
      const lottoInfo = {
        'embed': {
          'color': config.colors.default,
          'title': lotto.starter.tornName + ' is running a lotto for *' + lotto.prize + '*',
          'fields': [
            {
              'name': 'Number of entrants: ',
              'value': lotto.joins.length,
            },
            {
              'name': 'Elapsed time: ',
              'value': moment.duration(Date.now() - lotto.startTime).humanize(),
            },
          ]
        }
      };
      return lotto.channel.send(lottoInfo);
    }

    if (!args[0]) {
      return message.reply('You did not specify a prize. Lottos are more fun when you actually offer something to win.');
    }

    // Must set the original reference.
    lotto = client.lotto = {
      starter: message.author,
      channel: message.channel,
      startTime: Date.now(),
      prize: args.join(' '),
      lc: true,
      joins: [],
      ggs: [],
      tys: [],
      roasts: [],
    };

    // Update database.
    client.ensureMemberStats(lotto.starter.id);
    client.updateGameStats('lotto', 'started', lotto.starter.id);

    client.decorateUser(lotto.starter, message);

    const output = {
      content: 'New <@934947272419061812>',
      embed: {
        color: config.colors.default,
        // author: {
        //   name: 'New lotto started!'
        // },
        title: lotto.starter.tornName + ' started a new lotto for *' + lotto.prize + '*',
        fields: [
          {
            name: 'Starter commands:',
            value: '`' + config.prefix + 'lc` Announce last call\n' +
              '`' + config.prefix + 'draw` Draw the winner\n' +
              '`' + config.prefix + 'cancel` Cancel the lotto'
          },
          {
            name: 'Player commands:',
            value: '`' + config.prefix + 'j` Join'
          },
          {
            name: 'Notifications:',
            value: 'Grant yourself the `lotto` role in <#863805186518810624> in order to be notified when a lotto is started.'
          }
        ],
      }
    };
    message.channel.send(output);
    message.delete();

  } catch (e) {
    client.logger.error(`Error executing 'lotto' command: ${e}`);
  }
};

exports.shutdown = async (client) => {
  try {
    if (client.lotto) {
      client.logger.log('Shutting down lotto...');
      client.lotto.channel.send(`I'm being rebooted, so I need to cancel this lotto. Blame the..  \*cough\*  @API Developer.  ..Don\'t..  \*cough\*  ..blame..  \*gasp\*  me.`);
      client.lotto = null;
      client.logger.log('Lotto has been shutdown.');
    }
  } catch (e) {
    client.logger.error(`Error shutting down 'lotto' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'lotto',
  category: 'Fun',
  description: 'Starts a lotto contest.',
  detailedDescription: 'Starts a lotto contest which is a free drawing for any member who joins.\n\nStarter Commands\n\t!lotto, !lastcall, !draw, !cancel\n\nParticipant Commands\n\t!join, !goodgame, !thankyou',
  usage: 'lotto',
};
