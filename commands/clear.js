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
      return message
        .reply('Clear command disabled in this channel')
        .then(repliedMessage => {
          setTimeout(() => repliedMessage.delete(), 3000);
        })
    }

    // Max 100 lines to bulk delete
    const numLines = parseInt(args[0] ?? 99);
    client.logger.debug(`Will try to delete ${numLines} messages`);


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
      client.logger.debug(`method: deleteIncrementally ${numLines} lines`);
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
      client.logger.debug(`method: deleteBulk ${messages.size - 1} lines`);
      channel
        .bulkDelete(messages)
        .then((response) => {
          showFeedback(`Deleted ${messages.size - 1} messages`);
        })
        .catch(error => {
          errorHandler(error);
          if (error.code == 50034) {
            client.logger.log('Aborting delete because at least one message is older than 14 days');
            message.reply('Aborting delete because at least one message is older than 14 days');
            // Danger, this next command seemingly started deleting continuously.
            // client.logger.log('Switching to incremental delete because messages are older than 14 days');
            // return deleteIncrementally(messages.size);
          }
        });
    }

    /**
     * Give feedback but delete it after a few seconds.
     * @param {Number} numLines
     */
    function showFeedback(msg) {
      client.logger.debug('method: showFeedback');
      message
        .reply(msg)
        .then(repliedMessage => {
          setTimeout(() => repliedMessage.delete(), 8000);
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
      .then((msgs) => {
        const deletableMessages = msgs.filter(message => !message.pinned);
        client.logger.log(`Number of messages to retrieved for delete: ${deletableMessages.size}`);
        if (numLines + 1 > deletableMessages.size) {
          showFeedback(`Skipped ${numLines + 1 - deletableMessages.size} pinned message(s)`);
        }
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
