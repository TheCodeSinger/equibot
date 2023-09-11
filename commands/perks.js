/**
 * Display active faction perks.
 *
 * @example   !perks
 * @example   !perks eq1
 * @example   !perks Equilibrium
 * @example   !perks all
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    const specifiedFaction = (args[0] || '').toLowerCase();
    const factionList = client.config.factionList;
    const allApiKeys = client.auth.factionApiKeys;
    const selectedApiKeys = [];
    const urls = [];

    // category mappings, to add more copy and paste the text from the faction page
    // do not use the wording on the torn wiki page as some entries are worded differently
    // this is not a complete list and will need to be adjusted moving forward as eq or
    // eq2 unlock/leverage other branches.
    const categories = {
        'Toleration' : [
            'drug addiction gain reduction',
            'drug overdose risk reduction',
            'drug addiction mitigation and side effects reduction',

            'passive negatives from drugs and addiction',
        ],

        'Voracity' : [
            'nerve gain from alcohol',
            'maximum booster cooldown',
            'energy gain from energy drinks',
            'happy gain from candy',
        ],

        'Suppression' : [
            'upon escape attempt',
            'dexterity passively',
            'defense passively',
            'maximum life',
        ],

        'Steadfast' : [
            'strength gym gains',
            'speed gym gains',
            'defense gym gains',
            'dexterity gym gains',
        ],

        'Excursion' : [
            'travel item capacity',
            'rehabilitation cost reduction',
            'travelling fees',
            'hunting income',
            'cayman bank interest',
        ],

        'Fortitude' : [
            'Reduces the energy used while reviving',
            'incoming hospital time reduction',
            'minutes maximum medical cooldown',
            'life regeneration',
            'medical item effectiveness',
        ],

        'Aggression' : [
            'all accuracy',
            'speed passively',
            'strength passively',
            'outgoing hospitalization time',
            'all damage',
        ],

        'Criminality' : [
            'passive crime XP',
            'maximum nerve',
            'jail time reduction',
            'crime exp and skill gain',
            'bust nerve cost',
            'bust success chance',
        ]
    };

    // Determine which factions are being requested.
    if (specifiedFaction) {
      client.logger.debug(`specifiedFaction: ${JSON.stringify(specifiedFaction)}`);
      // Determine specified faction.
      switch (specifiedFaction) {
        case 'eq1':
        case factionList['eq1'].toLowerCase():
          selectedApiKeys.push(allApiKeys['eq1']);
          break;

        case 'eq2':
        case factionList['eq2'].toLowerCase():
          selectedApiKeys.push(allApiKeys['eq2']);
          break;

        case 'eq3':
        case factionList['eq3'].toLowerCase():
          selectedApiKeys.push(allApiKeys['eq3']);
          break;

        case 'all':
          Object.keys(allApiKeys).forEach(apiKey => selectedApiKeys.push(allApiKeys[apiKey]));
          break;

        default:
          return message.reply('That is not a recognized faction name.');
      }
    } else {
      // No faction specified. Determine author's faction and display only those perks.
      function getFactionApiKey(role) {
        client.logger.debug(`getFactionApiKey(role): ${JSON.stringify(role.name)}`);
        const factionTag = factionList[role.name];
        if (!factionTag || !allApiKeys[factionTag]) {
          return;
        }
        return selectedApiKeys.push(allApiKeys[factionTag]);
      }
      message.member.roles.cache.some(getFactionApiKey);
    }

    if (!selectedApiKeys.length) {
      return message.reply('You do not have a recognized faction role. Contact your Discord admin.');
    }
    client.logger.debug(`selectedApiKeys: ${JSON.stringify(selectedApiKeys)}`);

    // generate a list of urls faction perk api keys.
    selectedApiKeys.forEach(apiKey => {
        urls.push(`https://api.torn.com/user/?selections=perks,profile&key=${apiKey}`);
    });
    client.logger.debug(`urls: ${JSON.stringify(urls)}`);

    // list of results for all specified factions.
    const results = await Promise.all(urls.map((url) => fetch(url).then((r) => r.json()))).catch((error) => {});
    client.logger.debug(`factionApiResults: ${JSON.stringify(results)}`);
    results.forEach(result => {
        const perk_map = {};
        let found_match = false;
        const unsorted_perks = [];

        // for each perk, check to see if a substring from any of the categories
        // match, if they do add it to perk_map in the structure of: k = category,
        // v = perk
        result['faction_perks'].forEach(perk => {
            Object.keys(categories).forEach(category_name => {
                // if the perk matches a substring, add it to the perk_map
                categories[category_name].forEach(perk_substr => {
                    if(perk.includes(perk_substr)) {
                        found_match = true;

                        // if the perk_map mapping does not exist, create it
                        if(!perk_map.hasOwnProperty(category_name)) {
                            perk_map[category_name] = [];
                        }
                        perk_map[category_name].push(perk);
                    }
                });
            });

            if(!found_match) {
                unsorted_perks.push(perk);
            }
        });

        let out = '';

        // format the output
        Object.keys(perk_map).forEach(category_name => {
            if(perk_map[category_name].length > 0) {
                out = out + '\n\n**' + category_name + '**\n' + perk_map[category_name].join('\n');
            }
        });

        // append unmatched perks to the end of the output
        if(unsorted_perks.length > 0) {
            out = out + '\n\n**Unsorted**\n' + unsorted_perks.join('\n');
        }

        return message.channel.send({
            embed: {
                title: result['faction']['faction_name'] + ' Perks',
                description : out,
            }
        });
    });
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 'User',
};

exports.help = {
    name: 'perks',
    category: 'Faction',
    description: 'Shows active faction perks',
    detailedDescription: 'Shows active faction perks. If you do not specify a faction, it will display the perks for your faction. You may specify a faction name "all" to see perks for all factions.\n\n\t!perks\n\t!perks eq1\n\t!perks Equilibrium\n\t!perks all',
    usage: 'perks',
};
