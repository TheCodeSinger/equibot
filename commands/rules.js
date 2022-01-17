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
                   '2. Live on a Private Island\n' +
                   '3. Maintain Subscriber/Donator Status\n' +
                   '4. Armory Xanax and Refills are for Chains only\n' +
                   '5. Join Torn Stats, YATA, and our Discord server\n',
          },
          {
            name: 'PARTICIPATION',
            value: '6. Be in Torn when OC is ready\n' +
                   '7. Contribute 1% hits to chains\n',
          },
          {
            name: 'PERSONAL GROWTH',
            value: '8. Train at least 500 energy per day\n' +
                   '9. Consume 2+ Xanax (or LSD) per day.\n',

          },
        ],
        footer: {
          text: 'Last updated: Jan 16, 2022',
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
