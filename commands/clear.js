/**
 * Clears specified number of messages from the channel. If not specified,
 * then clears up to a maximum of 100 messages. Any pinned items will be
 * skipped
 *
 * @example   !clear 5
 * @example   !clear
 */
 exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  try {
    const channel = message.channel;

    if (client.config.protectedChannels.includes(channel.id)) {
      return channel.send('This command is reserved for someone special... not you.');
    }

    // Max 100 lines to bulk delete
    const numLines = args[0] ?? 99;

    /**
     * Silly use case to delete zero messgaes, but let's handle it appropriately.
     */
    if (numLines == 0) {
      // At least delete the `!clear 0` command
      message.delete();
      return;
    }

    /**
     * Delete a number of lines one after another, consecutively.
     * @param {Number} numLines
     */
    function deleteIncrementally(numLines) {
      client.logger.debug('method: deleteIncrementally');
      let countDeleted = 0;
      channel.messages
        .fetch({ limit: numLines })
        .then(messages => {
          messages.forEach(message => {
            if (!message.pinned) {
              message.delete();
              countDeleted++;
            }
          });
          showFeedback(countDeleted - 1);
        })
        .catch(error => {
          errorHandler(error);
        });
    }

    /**
     * Delete the provided list of messages from the channel.
     * @param {Array} messages
     * @param {Number} numLines
     */
    function deleteBulk(messages) {
      client.logger.debug('method: deleteBulk');
      channel
        .bulkDelete(messages)
        .then((response) => {
          showFeedback(messages.size - 1);
        })
        .catch(error => {
          errorHandler(error);
          if (error.code == 50034) {
            client.logger.log('Switching to incremental delete because messages are older than 14 days');
            return deleteIncrementally(numLines + 1);
          }
        });
    }

    /**
     * Give feedback but delete it after a few seconds.
     * @param {Number} numLines
     */
    function showFeedback(numLines) {
      client.logger.debug('method: showFeedback');
      message
        .reply(`Deleted ${numLines} messages`)
        .then(repliedMessage => {
          setTimeout(() => repliedMessage.delete(), 3000);
        })
        .catch(error => {
          errorHandler(error);
        });
    }

    /**
     * Print the error object in the log.
     * @param {Object} error
     */
    function errorHandler(error) {
      return client.logger.error(JSON.stringify(error));
    }

    channel.messages
      .fetch({ limit: numLines + 1 })
      .then((messages) => {
        const deletableMessages = messages.filter(message => !message.pinned);
        client.logger.log(`Number of messages to retrieved for delete: ${deletableMessages.size}`);
        deleteBulk(deletableMessages);
      }).catch(error => {
        errorHandler(error);
        client.logger.error(error.stack);
        message.reply(error.message);
      });

  } catch (e) {
    client.logger.error(`Error executing 'clear' command: ${e}`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'User'
};

exports.help = {
  name: 'clear',
  category: 'System',
  description: 'Clears chat messages',
  usage: 'clear 5'
};
