const moment = require("moment");

/**
 * Starts a game of Rock, Paper, Scissors to play for a prize. Other members can `!join`
 * and the host can `!draw` when ready.
 *
 * The command expects an argument which is the prize to be given away. If no
 * argument provided, the command will display info about the current rps.
 *
 * Commands for:
 *   Hosts: !rps, !lastcall, !draw, !cancel
 *   Participants: !join, !goodgame, !thankyou
 *   Everyone: !rpsinfo, !roast
 *
 * @example   !rps 10 Xanax
 * @example   !rps
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {

    const registrationPeriodMs = 30000;
    const answerPeriodMs = 30000;

    let rps = client.rps;
    const config = client.config;

    if (rps) {
      // Already a game of rps running.
      if (args[0]) {
        return message.reply('There is already a rps running. Please wait for this one to be completed.');
      }

      // Display the rps info.
      client.decorateUser(rps.starter, message);
      const rpsInfo = {
        'embed': {
          'color': config.colors.default,
          // 'title': rps.starter.tornName + ' started a game of RPS for *' + rps.prize + '*',
          'title': rps.starter.tornName + ' started a game of RPS',
          'fields': [
            {
              'name': 'Players: ',
              'value': rps.entrants.join(', '),
            },
            {
              'name': 'Elapsed time: ',
              'value': moment.duration(Date.now() - rps.startTime).humanize(),
            },
          ],
        }
      };
      return rps.channel.send(rpsInfo);
    }

    // if (!args[0]) {
    //   return message.reply('You did not specify a prize. Games are more fun when you actually offer something to win.');
    // }



    //
    // Starting new game of RPS
    //

    // Must set the original reference.
    rps = client.rps = {
      starter: message.author,
      channel: message.channel,
      startTime: Date.now(),
      prize: args.join(' '),
      entrants: [],
      round: 1,
    };

    // Update database.
    // client.ensureMemberStats(rps.starter.id);
    // client.updateGameStats('rps', 'started', rps.starter.id);

    const registrationMsg = {
      embed: {
        color: config.colors.default,
        title: 'Rock, Paper, Scissors',
        description: rps.starter.username + ' has called for a new game of Rock, Paper, Scissors.\n\n' +
          'Within the next ' + registrationPeriodMs/1000 + ' seconds, type `rps` for a chance to play. ' +
          'Then two players will be selected to compete.',
        footer: {
          text: 'Note: This game is still in development.'
        }
      }
    }

    function getStartMessage(player1, player2) {
      return {
        embed: {
          color: config.colors.default,
          title: 'Rock, Paper, Scissors',
          description: player1.toString() + ' vs ' + player2.toString() + '\n\n' +
           'I\'ve sent a direct message to each of you.\n\n' +
           'You will remain in your DM channel until I ping you again in this public channel.',
        }
      }
    }

    function publicRoundMsg(rps, a1, a2, winner) {
      client.decorateUser(a1[1], message);
      client.decorateUser(a2[1], message);
      client.logger.debug(`publicRoundMsg(${JSON.stringify(rps.starter.username)}, ${a1}, ${a2}, ${winner})`);
      let footerText = `${rps.starter.toString()}, please send your **${rps.prize}** and then paste the sent message to record your prize.`;
      let resultText = '';

      // Temporarily no prize involved.
      footerText = '';

      switch(winner) {
        case 0:
          // Draw
          resultText = '**DRAW**! Go again..';
          footerText = '';
          break;

        case 1:
          // Player 1
          resultText = `Winner: ${a1[1].toString()}\n\n ${footerText}`;
          break;

        case 2:
          // Player 2
          resultText = `Winner: ${a2[1].toString()}\n\n ${footerText}`;
          break;

        default:
          // Both timed out.
          resultText = 'You\'re Both Losers';
      }

      return {
        content: winner > 0 ? `${a1[1].toString()} ${a2[1].toString()}` : '',
        embed: {
          color:config.colors.default,
          author: {
            name: `Rock-Paper-Scissors Round ${rps.round} results`,
          },
          description: a1[1].tornName + ': **' + a1[0].toUpperCase() + '**\n' +
          a2[1].tornName + ': **' + a2[0].toUpperCase() + '**\n\n' +
            resultText,
        }
      }
    }

    /**
     * Determines the winner based on the two answers.
     *
     * Returns
     *   -1 for mutual timeout
     *    0 for a draw
     *    1 or 2 for the winning player
     */
    function getRpsWinner (answer1, answer2) {
      client.logger.debug(`getRpsWinner(${answer1}, ${answer2})`);
      if (answer1 === answer2) {
        if (answer1 === 'timeout' && answer2 === 'timeout') {
          return -1;
        }
        return 0;
      }
      if (answer1 === 'rock' && answer2 === 'scissors') { return 1; }
      if (answer1 === 'rock' && answer2 === 'paper') { return 2; }
      if (answer1 === 'paper' && answer2 === 'rock') { return 1; }
      if (answer1 === 'paper' && answer2 === 'scissors') { return 2; }
      if (answer1 === 'scissors' && answer2 === 'paper') { return 1; }
      if (answer1 === 'scissors' && answer2 === 'rock') { return 2; }
      if (answer1 === 'timeout') { return 2; }
      if (answer2 === 'timeout') { return 1; }
    }

    function dmPrompt() {
      let titleText = '';

      if (rps.round > 1) {
        titleText = `Round ${rps.round - 1} was a DRAW. Go again!`;
      }

      return {
        embed: {
          color: config.colors.default,
          author: {
            name: `Rock-Paper-Scissors Round ${rps.round}`,
          },
          title: titleText,
          description: 'Answer with `rock`, `paper` or `scissors` in the next ' + answerPeriodMs/1000 + ' seconds!',
        }
      }
    }

    function playRPSMsg(rps, player) {
      player.createDM().then((chan) => {
        chan.send(dmPrompt())
          .then(() => {
            chan.awaitMessages(response =>
                (response.author.id === player.id && (['rock', 'paper', 'scissors'].includes(response.content.toLowerCase()))),
              {
                max: 1,
                time: answerPeriodMs,
                errors: ['time'],
              })
              .then((collected) => {
                chan.send('Answer collected');
                let answer = [collected.first().content.toLowerCase(), player];
                client.logger.log(`${JSON.stringify(answer[1].tornName)} chose ${JSON.stringify(answer[0])}`);
                if (rps.answer) {
                  let winner = getRpsWinner(rps.answer[0], answer[0]);
                  rps.channel.send(publicRoundMsg(rps, rps.answer, answer, winner));

                  if (winner > 0) {
                    // Winner determined.
                    rps = client.rps = null;
                  } else {
                    playRPSMsg(rps, rps.answer[1]);
                    playRPSMsg(rps, answer[1]);
                    rps.round += 1;
                    rps.answer = null;
                  }
                } else {
                  rps.answer = answer;
                }
              })
              .catch((e, f) => {
                client.logger.debug(`awaitMessages catch: ${JSON.stringify(e)} ${JSON.stringify(f)}`);
                chan.send('Time is up! Return to the public channel.');
                let answer = ['timeout', player];
                if (rps.answer) {
                  let winner = getRpsWinner(rps.answer[0], answer[0]);
                  rps.channel.send(publicRoundMsg(rps, rps.answer, answer, winner));
                  rps = client.rps = null;
                } else {
                  rps.answer = answer;
                }
              });
          });
        player.deleteDM();
      });
    }

    message.channel.send(registrationMsg).then(() => {
      // Ignore anything other than 'rps' as a message.
      const contentFilter = response => (
        // response.author !== message.author &&
        response.content.toLowerCase().includes('rps')
      );
      const collector = message.channel.createMessageCollector(contentFilter, { time: registrationPeriodMs });

      collector.on('collect', msg => {
        client.logger.debug(`Responded: ${JSON.stringify(msg.author)}`);
        // Register each respondant, but ignore double entries.
        if (!(rps.entrants.includes(msg.author))) {
          rps.entrants.push(msg.author);
          msg.channel.send(msg.author.toString() + 'is registered.');
          msg.delete();
        }
      });

      collector.on('end', collected => {
        client.logger.debug(`Total Responded: ${JSON.stringify(collected.size)}`);
        client.logger.debug(`Total Registered: ${JSON.stringify(rps.entrants)}`);
        if (rps.entrants.length < 2) {
          // Did not get at least two entrants.
          message.channel.send('At least two players needed. RPS canceled.');
          rps = client.rps = null;
        } else {
          // Select two unique entrants.
          let player1 = client.getRandomItem(rps.entrants);
          let player2 = client.getRandomItem(rps.entrants);
          while (player1 === player2) {
            player2 = client.getRandomItem(rps.entrants);
          }
          message.channel.send(getStartMessage(player1, player2));

          playRPSMsg(rps, player1);
          playRPSMsg(rps, player2);
        }
      });
    });
    message.delete();

  } catch (e) {
    client.logger.error(`Error executing 'rps' command: ${e}`);
    message.channel.send('RPS aborted due to an error.');
    rps = client.rps = null;
  }
};

exports.shutdown = async (client) => {
  try {
    if (client.rps) {
      client.logger.log('Shutting down RPS...');
      client.rps.channel.send(`I'm being rebooted, so I need to cancel this game of RPS. Blame the..  \*cough\*  @API Developer.  ..Don\'t..  \*cough\*  ..blame..  \*gasp\*  me.`);
      client.rps = null;
      client.logger.log('RPS has been shutdown.');
    }
  } catch (e) {
    client.logger.error(`Error shutting down 'rps' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'rps',
  category: 'Fun',
  description: 'Starts Rock, Paper, Scissors.',
  detailedDescription: '[BETA] Starts a game of Rock, Paper, Scissors.',
  usage: 'rps',
};