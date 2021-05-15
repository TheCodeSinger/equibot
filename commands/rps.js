const { Collection } = require("discord.js");
const moment = require("moment");

/**
 * Starts a game of Rock, Paper, Scissors to play for a prize.
 *
 * The command expects an argument which is the prize to be given away. If no
 * argument provided, the command will display info about the current game.
 *
 * Commands for:
 *   Hosts: !cancel
 *
 * @example   !rps 10 Xanax
 * @example   !rps cancel
 * @example   !rps
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const isBotAdmin = client.levelCache['Bot Support'] <= level;
    const config = client.config;

    // How long to wait for people to register to play.
    const registrationPeriodMs = 15000;

    // How long to wait for each player reponse.
    const answerPeriodMs = 30000;

    // Cache reference to the game data.
    let rps = client.rps;

    client.decorateUser(message.author, message);

    if (rps) {
      // Already a game of RPS running.
      if (args[0]) {
        if (args[0].toLowerCase() === 'cancel') {
          // Check if admin is intervening.
          if (message.author === rps.starter || isBotAdmin) {
            // Author is authorized. Cancel game.
            rps = client.rps = null;
            client.logger.log(message.author.username + ' cancelled the game of RPS.');
            return message.channel.send(message.author.toString() + ' cancelled the current game of RPS.');
          } else {
            // Author is NOT authorized. Do NOT cancel game.
            client.logger.debug(message.author.username + ' is NOT authorized to cancel');
            return message.reply('Only the starter (or a bot admin) can cancel a game of RPS.');
          }
        }

        client.logger.debug(message.author.username + ' tried to start a new RPS but one is running.');
        return message.reply('There is already a game of RPS running. Please wait for this one to be completed.');
      }

      // Author issued `!rps` command by itself while a game is running.
      // Display game info.
      client.decorateUser(rps.starter, message);
      function rpsGameInfo() {
        const listOfFields = [
          {
            name: 'Elapsed time: ',
            value: moment.duration(Date.now() - rps.startTime).humanize(),
          }
        ];

        if (rps.round === 0) {
          listOfFields.push({
            name: 'Registered players: ',
            value: rps.entrants.join(', ') || 'None yet!',
          });
        } else {
          listOfFields.push({
            name: 'Competing right now: ',
            value: rps.selected.join(', '),
          });
        }

        return {
          embed: {
            color: config.colors.default,
            // 'title': rps.starter.tornName + ' started a game of RPS for *' + rps.prize + '*',
            title: rps.starter.tornName + ' started a game of RPS',
            fields: listOfFields,
          }
        }
      };
      return rps.channel.send(rpsGameInfo());
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
      selected: [],
      round: 0,
    };

    // Update database.
    // client.ensureMemberStats(rps.starter.id);
    // client.updateGameStats('rps', 'started', rps.starter.id);

    // Message displayed when the game is initialized.
    const registrationMsg = {
      embed: {
        color: config.colors.default,
        title: 'Rock, Paper, Scissors',
        description: '**' + rps.starter.username + '** has called for a new game of Rock, Paper, Scissors.\n\n' +
          'Within the next ' + registrationPeriodMs/1000 + ' seconds, type `rps` for a chance to play. ' +
          'Then two players will be randomly selected to compete.',
        footer: {
          text: 'Note: This game is still in development. It will be gambling game.'
        }
      }
    }

    // Message displayed after selecting the two players.
    function getStartMsg(player1, player2) {
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

    // Public message displayed after each round of play.
    function getPublicRoundMsg(rps, a1, a2, winner) {
      client.logger.log(`Round ${rps.round}: ${a1[0]} vs ${a2[0]}`);
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

    // Private message sent to each player, for each round.
    function getDmPrompt(previousAnswer) {
      let titleText = '';

      if (previousAnswer && rps.round > 1) {
        titleText = `You both answered ${previousAnswer.toUpperCase()}. Go again!`;
      }

      return {
        embed: {
          color: config.colors.default,
          title: titleText,
          description: 'Answer with `rock`, `paper` or `scissors` in the next ' + answerPeriodMs/1000 + ' seconds!',
        }
      }
    }

    /**
     * Creates a DM channel with the player and prompts them for their answer.
     * Then checks game data, and if the other player has submitted their answer,
     * we resolve the round. Otherwise, store this player's answer in the game data.
     */
    function promptPlayer(number, rps, player, previousAnswer) {
      player.createDM().then((dmChannel) => {
        // Set the dmChannel in the RPS game data.
        rps['dmChannel' + number] = dmChannel;

        // Store the other player number so we can reference them easily.
        const otherPlayerNumber = number === 1 ? 2 : 1;

        dmChannel.send(getDmPrompt(previousAnswer)).then(() => {
          client.logger.debug(``);
          // Ignore anything other than 'rock', 'paper', 'scissors' as a message.
          const answerFilter = response => (
            response.author.id === player.id && (['rock', 'paper', 'scissors'].includes(response.content.toLowerCase()))
          );
          const answerCollector = dmChannel.createMessageCollector(answerFilter, { max: 1, time: answerPeriodMs, errors: ['time'] });

          answerCollector.on('collect', msg => {
            const answer = [msg.content.toLowerCase(), player];
            client.logger.log(`${JSON.stringify(answer[1].tornName)} chose ${JSON.stringify(answer[0])}`);
            if (rps.answer) {
              dmChannel.send('Answer collected');
              const winner = getRpsWinner(rps.answer[0], answer[0]);
              rps.channel.send(getPublicRoundMsg(rps, rps.answer, answer, winner));

              if (winner > 0) {
                // Winner determined. Game over.
                dmChannel.send('Winner decided. Return to public channel.');
                rps['dmChannel' + otherPlayerNumber].send('Winner decided. Return to public channel.');
                rps = client.rps = null;
              } else {
                // It was a draw. Go again.
                promptPlayer(1, rps, rps.answer[1], answer[0]);
                promptPlayer(2, rps, answer[1], answer[0]);
                rps.answer = null;
                rps.round += 1;
              }
            } else {
              dmChannel.send('Answer collected. Wait for your opponent to decide.');
              rps.answer = answer;
            }
          });

          answerCollector.on('end', collected => {
            client.logger.debug(`answerCollector.on('end'): ${JSON.stringify(collected)}`);

            if (!client.rps) {
              // Game was likely cancelled. Do nothing.
              return;
            }

            if (!collected.size) {
              // No answer collected. Player timed out.
              client.logger.debug(`${player.tornName} timed out`);
              dmChannel.send('Time is up! Too slow. Return to the public channel.');
              rps['dmChannel' + otherPlayerNumber].send('Winner decided. Return to public channel.');
              const answer = ['timeout', player];
              if (rps.answer) {
                const winner = getRpsWinner(rps.answer[0], answer[0]);
                rps.channel.send(getPublicRoundMsg(rps, rps.answer, answer, winner));
                rps = client.rps = null;
              } else {
                rps.answer = answer;
              }
            }

            // Answer collected. Nothing more to do beyond what was handled in
            // the answerCollector.on('collect')
          });
        });
        player.deleteDM();
      });
    }

    /**
     * Initializes a game of RPS and collects registrations. After the allotted
     * time, select two players and start the contest.
     */
    message.channel.send(registrationMsg).then(() => {
      // Display a visible countdown.
      client.displayCountdown(registrationPeriodMs/1000, message.channel, 'Starting in');

      // Ignore anything other than 'rps' as a message.
      const regFilter = response => (
        // response.author !== message.author &&
        response.content.toLowerCase() === 'rps'
      );
      const regCollector = message.channel.createMessageCollector(regFilter, { time: registrationPeriodMs });

      regCollector.on('collect', msg => {
        client.logger.debug(`Responded: ${JSON.stringify(msg.author)}`);
        // Register each respondant, but ignore double entries.
        if (!(rps.entrants.includes(msg.author))) {
          rps.entrants.push(msg.author);
          msg.channel.send(msg.author.toString() + 'is registered.');
          msg.delete();
        }
      });

      regCollector.on('end', collected => {
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

          client.decorateUser(player1, message);
          client.decorateUser(player2, message);

          rps.selected = [player1, player2];
          message.channel.send(getStartMsg(player1, player2));

          rps.round += 1;
          promptPlayer(1, rps, player1);
          promptPlayer(2, rps, player2);
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
  detailedDescription: '[BETA] Starts a game of Rock, Paper, Scissors. During an initial period of registration, anyone can type `rps` to register. Then two players will be selected at random to compete. The contest will take place via moderated DMs but can be monitored publicly in the channel where the game was started.',
  usage: 'rps',
};