/**
 * Displays a nice embedded output of a Torn item.
 *
 * @example   !info xanax
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
          url: 'https://lh3.googleusercontent.com/proxy/zJy91oF-pChOdsKYcD6dHV-Q4r3_mrOvWr938Q1vynAP1JBIlxDnUtRhVCBUqkj0T_JR5-meE1Hg7AK7cRz3TfeV5u-0jySWX74zvTB9xzbt12s',
        },
        title: 'Faction Minimum Requirememts',
        description: 'These are the minimum requirements to be considered in good standing. Repeated violation may result in being removed from the faction.',
        fields: [
          {
            name: 'BASIC REQUIREMENTS',
            value: '1. Log in daily\n2. Subscriber/Donator Status\n3. Armory Xanax and Refills are for Chains only',
          },
          {
            name: 'WITHIN THE FIRST 20 DAYS',
            value: '4. Attain level 15\n5. Join Torn Stats and YATA',
          },
          {
            name: 'AFTER LEVEL 15',
            value: '6. Be in Torn when OC is ready\n7. Contribute 22+ hits to large chains (2500+)\n8. Contribute 6+ hits to small chains (1000 or less)',
          },
        ],
        footer: {
          text: 'Last updated: June 15, 2020',
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
