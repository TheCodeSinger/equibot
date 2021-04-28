/**
 * Calls for an assist. This command will find the author's current fight and
 * provide a convenience link to the target.
 *
 * NOTE: THis does not work because the API does not expose the current attack.
 * This command presently returns with details from the latest completed attack.
 *
 * Future enhancments:
 *   1. Watch the fight and clean up after it is over.
 *   2. Provide stats estimate.
 *
 * @example   !assist
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const userAttacksApiUrl = `https://api.torn.com/user/?selections=attacks&key=${client.auth.apiKey}`;
    const attackUrl = `https://www.torn.com/loader.php?sid=attack&user2ID=`;
    const profileUrl = 'https://www.torn.com/profiles.php?XID=';
    const factionUrl = 'https://www.torn.com/factions.php?step=profile&ID=';
    const target = {
      name: 'Test Dummy',
      id: 1500001,
    };

    const author = message.author;
    client.decorateUser(author, message);

    fetch(userAttacksApiUrl)
      .then(response => response.json())
      .then(data => {
        if (!data) {
          return message.channel.send({ embed: { description: 'API returned an expected error.' } });
        }

        if (data.error) {
          return client.handleApiError(data, channel, userAttacksApiUrl);
        }
        client.logger.debug(`Response: ${JSON.stringify(data)}`);

        const attacks = data.attacks;
        const keys = Object.keys(attacks);
        const latestAttack = attacks[keys[keys.length - 1]];
        client.logger.log(`Latest attack: ${JSON.stringify(latestAttack)}`);

        if (!latestAttack.timestamp_ended) {
          // No fight in progress.
          return message.channel.send({
            embed: {
              description: `No fight found. Either ${author.tornName} unexpectedly won the fight or they are already in the hospital.`
            }
          });
        }

        Object.assign(target, latestAttack);

        const output = {
          embed: {
            color: client.config.colors.default,
            title: `${author.tornName} needs an assist!`,
            description: `Join the attack against [${target.defender_name}](${attackUrl}${target.defender_id}) of ${target.defender_factionname}.\n`,
            fields: [
              {
                name: 'Target: ',
                value: `${target.defender_name} [${target.defender_id}] ` +
                  `[Profile](${profileUrl}${target.defender_id}) | ` +
                  `[Faction](${factionUrl}${target.defender_faction})`,
              }
            ]
          }
        }
        return message.channel.send(output);

        })
      .catch(error => client.logger.error(`Error in fetchUserAttacks(): ${JSON.stringify(error)}`));

  } catch (e) {
    client.logger.error(`Error executing 'assist' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
};

exports.help = {
  name: 'assist',
  category: 'Faction',
  description: 'Calls for an assist',
  usage: 'assist',
};
