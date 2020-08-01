const fetch = require('isomorphic-fetch');

/**
 * Displays a drumroll giphy.
 *
 * @example   !drumroll
 */
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const giphyApiUrl = 'https://api.giphy.com/v1/gifs/random?api_key=kaoygsqVRMO0HjtacuJnYlh5oINJ4IEd&tag=drumroll';

    fetch(giphyApiUrl)
      .then(response => response.json())
      .then(response => {
        if (response.error) {
          return client.handleApiError(response, channel, giphyApiUrl);
        }
        console.log(response);
        message.channel.send(response.data.images.fixed_height_small.url);
      })
      .catch(error => client.logger.error(`Error in fetchGiphyUrl: ${JSON.stringify(error)}`));
  } catch (e) {
    client.logger.error(`Error executing 'drumroll' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['dr', 'drum'],
  permLevel: 'User',
};

exports.help = {
  name: 'drumroll',
  category: 'Fun',
  description: 'Starts a drum roll.',
  usage: 'drumroll',
};
