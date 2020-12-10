/**
 * Display EQ and EQ2 Perks
 *
 * @example   !perks
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars

    // category mappings, to add more copy and paste the text from the faction page
    // do not use the wording on the torn wiki page as some entries are worded differently
    // this is not a complete list and will need to be adjusted moving forward as eq or
    // eq2 unlock/leverage other branches.
    var categories = {
        'Toleration' : [
            'Reduces drug addiction gain by',
            'Decreases risk of overdose by',
            'Reduces passive negatives from drugs and addiction by',
        ],

        'Voracity' : [
            'Increases nerve gain from alcohol by',
            'hours of maximum booster cooldown',
            'Increases energy gain from energy drinks by',
            'Increases happy gain from candy by',
        ], 

        'Suppression' : [
            'upon escape attempt',
            'Increases dexterity passively by',
            'Increases defense passively by',
            'Increases maximum life by',
        ],

        'Steadfast' : [
            'Increases strength gym gains by',
            'Increases speed gym gains by',
            'Increases defense gym gains by',
            'Increases dexterity gym gains by',
        ],

        'Excursion' : [
            'Increases maximum traveling capacity by',
            'Reduces travelling fees by',
            'Increases hunting income by',
            'Reduces rehabilitation costs by',
            'ncreases cayman bank interest by',
        ]
    };

    var urls = []

    // generate a list of urls for faction name and faction perk api calls
    Object.keys(client.auth.factionApiKeys).forEach(faction_key => {
        var api_key = client.auth.factionApiKeys[faction_key];
        urls.push(`https://api.torn.com/user/?selections=perks,profile&key=${api_key}`);
    });

    // list of results for all factions defined in client.auth.factionApiKeys
    const results = await Promise.all(urls.map((url) => fetch(url).then((r) => r.json()))).catch((error) => {});
    results.forEach(result => {
        perk_map = {}

        // for each perk, check to see if a substring from any of the categories
        // match, if they do add it to perk_map in the structure of: k = category, 
        // v = perk
        result['faction_perks'].forEach(perk => {
            Object.keys(categories).forEach(category_name => {

                // if the perk_map mapping does not exist, create it
                if(!perk_map.hasOwnProperty(category_name)) {
                    perk_map[category_name] = [];
                }

                // if the perk matches a substring, add it to the perk_map
                categories[category_name].forEach(perk_substr => {
                    if(perk.includes(perk_substr)) {
                        perk_map[category_name].push(perk);
                    }
                })
            })
        });

        var out = ''

        // format the output
        Object.keys(perk_map).forEach(category_name => {
            if(perk_map[category_name].length > 0) {
                out = out + '\n\n**' + category_name + '**\n'
                out = out + perk_map[category_name].join('\n')
            }
        });

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
    permLevel: 'User'
};

exports.help = {
    name: 'perks',
    category: 'Torn',
    description: 'Shows EQ and EQ2 Faction perks',
    usage: 'perks'
};