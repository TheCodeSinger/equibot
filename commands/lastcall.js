exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const lotto = client.lotto;
    const config = client.config;

    if (!lotto) {
      return message.reply('No active lotto. Why don\'t you start one?');
    }

    if (message.author !== lotto.starter) {
      return message.reply('Only the lotto starter can make the last call.');
    }

    if (lotto.winner) {
      return message.reply('The winner for this lotto has already been drawn.');
    }

    if (!lotto.lc) {
      return message.reply('Sorry, you may only make one `Last call!`');
    }

    lotto.channel.send(`Last call for <@&934941724915150979> to win **${lotto.prize}**`);
    lotto.lc = false;
    message.delete();

  } catch (e) {
    client.logger.error(`Error executing 'lastcall' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ['lc'],
  permLevel: 'User',
};

exports.help = {
  name: 'lastcall',
};
