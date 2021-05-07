/**
 * Displays a clickable link to the Torn profile for the specified member.
 *
 * @example   !idea I think we should have a way to send in our ideas.
 */
 exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    if (!args[0]) {
      message.channel.send('Don\'t waste my time. Actually tell me your brilliant idea.');
      return;
    }

    const idea = `${message.author.toString()} sends the following message:\n${args.join(' ')}`;

    /**
     * Send DM to developers.
     *   Aarlo: 550079162564476997
     *   kastang: 576918909672751124
     *   Orion: 320016515602579456
     */
    const developerIds = ['550079162564476997', '576918909672751124', '320016515602579456'];
    developerIds.forEach(id => {
      const guild = message.guild;
      if (guild) {
        const developer = guild.member(id);
        if (developer) {
          developer.send(idea);
        } else {
          client.logger.debug(`No member found with ID ${id}.`);
        }
      } else {
        client.logger.debug(`No guilds found. Must have been a DM.`);
      }
    });

    const listOfConfirmations = [
      'Don\'t worry. I forwarded your idea. I just haven\'t had my coffee today.',
      'Sorry about that. It\'s been a bad day.',
      'Message sent to the dev team. Maybe.',
      'Contrary to my public persona, I\'m really a nice bot if you get to know me.',
      'Message sent. Thank you for your mostly acceptable idea.',
      'Idea submitted. I didn\'t want to let on publicly, but I actually think it\'s a fantastic idea. Thank you.',
      'I\'m not a bad person. Really. I\'m just misunderstood.'
    ];

    const listOfInsults = [
      // Aarlo's list
      'Wow, you really broke the mold with that idea. :face_vomiting:',
      'You want me to bother the dev team with that brilliant idea? Yeah right.',
      'It\'s been said that "No idea is a bad idea." Sorry, but I don\'t think we can say that anymore.',
      'No way! Not touching that with a ten-foot pole.',
      'I\'ve got an idea, too. *Maybe* you should think a little harder before you share your ideas.',
      'You\'re only allowed one good idea per day. I\'ve yet to see you meet your quota.',

      // Cony_Cage's list
      'Since you know it all, you should also know when to shut up.',
      'This suggestion looks like something I wrote with my left hand after having 3 strokes.',
      'If I was a bird I\'d know who to shit on. Oh wait, I am a bird.',
      'As a bot, I\'m always forced to do shit I\'m not qualified for. Like being nice to fucking idiots.',
      'Oh, so you\'re the reason there\'s instructions on shampoo.',
      'I hope that one day you choke on your keyboard.',
      'If you have another suggestion: raise one hand. Now put it over your mouth.',
      'Giving a fuck really doesn\'t go with my outfit today.',
      'You smell like drama and a headache, please go away.',
      'Due to budgetary restraints I can only please one person per day. Today is not your day; tomorrow doesn\'t look good either.',
    ];

    /**
     * Send to a channel.
     *   #api-dev: 680114562057502771
     */
    const devChannelId = '680114562057502771';
    const channel = client.channels.cache.find(channel => channel.id === devChannelId);
    if (channel) {
      channel.send(idea);
    } else {
      client.logger.debug(`No channel found with ID ${devChannelId}.`);
    }

    // Send public insult.
    message.reply(client.getRandomItem(listOfInsults));

    // Send private confirmation.
    message.author.send(client.getRandomItem(listOfConfirmations));
  } catch (e) {
    client.logger.error(`Error executing 'idea' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['bug', 'idea', 'feedback', 'suggestion'],
  permLevel: 'User'
};

exports.help = {
  name: 'idea',
  category: 'System',
  description: 'Sends message to bot developers.',
  usage: 'idea <description of idea, bug, suggestion, or comment>'
};
