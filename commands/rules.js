/**
 * Displays the faction rules.
 *
 * @example   !rules
 */
 exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {

    /**
     * Returns an embed for displaying faction rules.
     *
     * @return  {Object}  Embed object for faction rules.
     */
    rulesEmbed = {
      embed: {
        color: client.config.colors.default,
        thumbnail: {
          url: 'https://cdn.discordapp.com/attachments/645831366059098135/749464503606837308/61a8fR43rIL._AC_SL1500_.jpg',
        },
        title: 'Faction Minimum Requirememts',
        description: 'These are the minimum requirements to be considered in good standing. Repeated violation may result in being removed from the faction.',
        fields: [
          {
            name: 'BASIC REQUIREMENTS',
            value: '1. Log in daily\n' +
                   '2. Maintain Subscriber/Donator Status\n' +
                   '3. Armory Xanax and Refills are for Chains only\n',
          },
          {
            name: 'WITHIN THE FIRST 30 DAYS',
            value: '4. Attain level 15\n' +
                   '5. Join Torn Stats, YATA, and our Discord server\n',
          },
          {
            name: 'AFTER LEVEL 15',
            value: '6. Share a Private Island\n' +
                   '7. Be in Torn when OC is ready\n'+
                   '8. Contribute 1% hits to chains\n',
          },
          {
            name: 'AFTER 60 DAYS',
            value: '9. Consume 1+ Xanax per day.\n',
          },
        ],
        footer: {
          text: 'Last updated: May 12, 2021',
        }
      }
    };

    message.channel.send(rulesEmbed);

  } catch (e) {
    client.logger.error(`Error executing 'rules' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'User'
};

exports.help = {
  name: 'rules',
  category: 'Faction',
  description: 'Displays minimum faction Requirements.',
  usage: 'rules'
};
