module.exports = (client) => {

  /**
   * Parses the parts of a member's Discord name.
   *
   * @param   {String}   name    A Discord member name.
   * @return  {Array[]}  The three string parts of a Discord name.
   */
  function getNameParts(name) {
    if (!name) {
      client.logger.error('Null `name` arg provided to `getNameParts(name)`');
      return [];
    }

    // Parses the name into parts: ['Aarlo [2252482]', 'Aarlo', '2252482']
    const parts = name.match(/(.*) \[(\d*)\]/) || [name, name, 'unknownId'];
    client.logger.debug('getNameParts(' + name + '): ' + parts);
    return parts;
  }

  /**
   * Parses the parts of a member's Discord name.
   *
   * @param   {String}   name    A Discord member name.
   * @return  {String}   The Torn name for the Discord User.
   */
  client.getTornName = (name) => {
    if (!name) {
      client.logger.error('Null `name` arg provided to `getTornName(name)`');
      return;
    }
    return getNameParts(name)[1];
  }

  /**
   * Parses the parts of a member's Discord name.
   *
   * @param   {String}   name    A Discord member name.
   * @return  {String}   The Torn ID for the Discord User.
   */
  client.getTornId = (name) => {
    if (!name) {
      client.logger.error('Null `name` arg provided to `getTornId(name)`');
      return;
    }
    const id = getNameParts(name)[2];
    return id === 'unknownId' ? undefined : id;
  }

};
