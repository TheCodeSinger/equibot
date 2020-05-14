const { prefix, color } = require('../config.js');
// const utils = require('./Utils.js');

/**
 * Embedders.
 */

const commands = {
  'embed': {
    'color': color,
    'author': {
      'name': 'Equilibrator'
    },
    'title': 'The best bot you will ever see! (Really!)',
    'description': 'If something doesn\'t work, PMM changed the code again. Send a DM',
    'fields': [
      {
        'name': prefix + 'commands',
        'value': 'Displays this.'
      },
      {
        'name': prefix + 'targets',
        'value': 'Show link to our awesome target web app.'
      },
      {
        'name': prefix + 'invite',
        'value': 'Show invite link to our EQ Discord server.'
      },
      {
        'name': prefix + 'info [item_name]',
        'value': 'Displays item information.'
      },
      {
        'name': prefix + 'link [user_name]',
        'value': 'Displays a link to their Torn profile.'
      },
      {
        'name': prefix + 'ft [item_name]',
        'value': 'See what our great trader is giving you for this.'
      },
      {
        'name': prefix + 'bazaar [torn_id]',
        'value': 'Check out someones bazaar (works while flying!).'
      },
      {
        'name': prefix + 'trout [user_name]',
        'value': 'Slap someone with a fish.'
      },
      {
        'name': prefix + 'lof | ' +
          prefix + 'ft | ' +
          prefix + 'blaking | ' +
          prefix + 'cony | ' +
          prefix + 'keetla | ' +
          prefix + 'pmm | ' +
          prefix + 'nauti | ' +
          prefix + 'metal | ' +
          prefix + 'madam',
        'value': 'Miscellaneous fun stuff'
      }
    ]
  }
};

const lottoInfo = {
  'content': 'Equi Family Lotto Bot',
  'embed': {
    'title': 'Share your wealth',
    'url': 'https://discordapp.com/',
    'color': color,
    'timestamp': '2020-05-03T13:13:02.193Z',
    'footer': {
      'icon_url': 'https://i.imgur.com/JwoN6cF.gif',
      'text': 'Created by Pommesmitmayo'
    },
    'thumbnail': {
      'url': 'https://cdn.discordapp.com/embed/avatars/0.png'
    },
    'image': {
      'url': 'https://i.imgur.com/JwoN6cF.gif'
    },
    'author': {
      'name': 'Equilibrator',
      'url': 'https://discordapp.com/',
      'icon_url': 'https://cdn.discordapp.com/embed/avatars/0.png'
    },
    'fields': [
      {
        'name': 'Start lotto',
        'value': prefix + 'lotto prize'
      },
      {
        'name': 'Draw lotto',
        'value': prefix + 'draw'
      },
      {
        'name': 'Countdown (soon)',
        'value': prefix + 'cd'
      },
      {
        'name': 'Join lotto',
        'value': prefix + 'j'
      }
    ]
  }
};

function lottoStartMsg(lotto) {
  return {
    'embed': {
      'color': config.color,
      'author': {
        'name': 'New lotto started!'
      },
      'title': lotto.starter.username + ' started a new lotto for ' + lotto.prize,
      'fields': [
        {
          'name': 'Starter commands:',
          'value': '`' + prefix + 'lc` Ping (works only once per lotto)\n' +
            '`' + prefix + 'draw` Draw\n' +
            '`' + prefix + 'cancel` Cancel lotto'
        },
        {
          'name': 'Player commands:',
          'value': '`' + prefix + 'j` Join'
        }
      ]
    }
  }
}

function lottoJoinMsg(lotto, user) {
  return {
    'embed': {
      'color': config.color,
      'description': user.toString() + ' joined as number ' + lotto.joins.length,
      'footer': {
        'text': 'Join now to have a chance at winning ' + lotto.prize
      }
    }
  }
}

function lottoCancelMsg(lotto) {
  return {
    'embed': {
      'color': config.color,
      'description': 'It appears that ' + lotto.starter.toString() + ' got cold feet and cancelled the lotto.',
      'footer': {
        'text': 'They probably deserve to be TP\'d or forked or some other innocous but socially approved form of hazing.'
      }
    }
  }
}

function lottoDrawMsg(lotto) {
  return {
    'content': ':tada: ' + lotto.winner.toString() + ' :tada:',
    'embed': {
      'color': config.color,
      'fields': [
        {
          'name': 'The winner is revealed!',
          'value': lotto.winner.toString() + ' won **' + lotto.prize + '** from ' + lotto.starter.toString()
        },
        {
          'name': 'Links for the host:',
          'value': '[' + lotto.winner.discordName + '](' + lotto.winner.tornLink +
            ')\n Please copy the sent message in the next 5 minutes to close the lotto.'
        },
        {
          'name': 'Show your love:',
          'value': '`' + prefix + 'gg` - Congratulate the winner\n `' + prefix + 'ty` - Thank the host'
        }
      ]
    }
  }
}

function rpsStartMsg(rps) {
  return {
    'embed': {
      'color': config.color,
      'author': {
        'name': 'New RPS started!'
      },
      'title': rps.starter.username + ' started a new game of Rock, Paper, Scissors for ' + rps.prize,
      'description': 'Write `RPS` in the next 60 seconds to join!'
    }
  }
}

function rpsEndMsg(rps, a1, a2, winner) {
  let title = null;
  if (winner === 'draw') {
    title = '**DRAW**, nobody won anything!';
  } else if (winner === 1) {
    title = a1[1].username + ' won **' + rps.prize + '**';
  } else {
    title = a2[1].username + ' won **' + rps.prize + '**';
  }
  return {
    'embed': {
      'color':config.color,
      'author': {
        'name': 'Rock-Paper-Scissors game concluded!'
      },
      'title': title,
      'description': a1[1].toString() + ': **' + a1[0].toUpperCase() + '**\n' +
        a2[1].toString() + ': **' + a2[0].toUpperCase() + '**\n\n' +
        rps.starter.username + ', please send the prize to the Winner (if there is any)!',
      'footer': {
        'text': 'Good luck next time to everyone else!'
      }
    }
  }
}

function itemInfo(items, id) {
  const item = items[id];
  const utils = require('./utils.js');
  return {
    'embed': {
      'color': config.color,
      'thumbnail': {
        'url': 'https://alltornup.netlify.com/TornItems965/' + id + '.png'
      },
      'author': {
        'name': item.name + ' #' + id
      },
      'fields': [
        {
          'name': 'Market value',
          'value': '$' + utils.formatNumber(item.market_value)
        },
        {
          'name': 'Circulation',
          'value': utils.formatNumber(item.circulation),
          'inline': true
        },
        {
          'name': 'Buy price',
          'value': '$' + utils.formatNumber(item.buy_price),
          'inline': true
        },
        {
          'name': 'Sell price',
          'value': '$' + utils.formatNumber(item.sell_price),
          'inline': true
        },
        {
          'name': 'Description',
          'value': item.description
        }
      ]
    }
  };
}

function fireTrading(items, id) {
  const item = items[id];
  return {
    'embed': {
      'color': config.color,
      'title': 'LordofFire\'s price:',
      'description': '[Start Trade](https://www.torn.com/trade.php#step=start&userID=2411517/) ' +
        '| [Pricelist](https://tinyurl.com/fire-trading-pricelist/)',
      'thumbnail': {
        'url': 'https://alltornup.netlify.com/TornItems965/' + id + '.png'
      },
      'author': {
        'name': item.name + ' #' + id
      },
      'image': {
        'url': 'https://arsonwarehouse.com/!/lordoffire/bids/' + id + '@2x.png'
      },
      'footer': {
        'text': 'Fire Trading'
      }
    }
  };
}

function phrase(phrase) {
  return {
    'embed': {
      'color': config.color,
      'title': 'Cony\'s wisdom',
      'description': phrase
    }
  };
}

function image(url, title) {
  return {
    'embed': {
      'color': config.color,
      'title': title,
      'image': {
        'url': url
      }
    }
  };
}

function stat(stats, name) {
  return {
    'embed': {
      'color': config.color,
      'author': {
        'name': name
      },
      'fields': [
        {
          'name': 'Strength',
          'value': stats.strength,
          'inline': true
        },
        {
          'name': 'Defense',
          'value': stats.defense,
          'inline': true
        },
        {
          'name': 'Speed',
          'value': stats.speed,
          'inline': true
        },
        {
          'name': 'Dexterity',
          'value': stats.dexterity,
          'inline': true
        }
      ]
    }
  }
}

function chain(chain) {
  return {
    'embed': {
      'color': config.color,
      'author': {
        'name': 'EQ2 Chain'
      },
      'fields': [
        {
          'name': 'Current',
          'value': chain.current,
          'inline': true
        },
        {
          'name': 'Max',
          'value': chain.max,
          'inline': true
        },
        {
          'name': 'Timeout',
          'value': chain.timeout,
          'inline': true
        },
        {
          'name': 'Modifier',
          'value': chain.modifier,
          'inline': true
        },
        {
          'name': 'Cooldown',
          'value': chain.cooldown,
          'inline': true
        }
      ]
    }
  }
}

const blaking = {
  'embed': {
    'color': config.color,
    'author': {
      'name': 'verb'
    },
    'title': 'Blaking (blak′ĭng)',
    'description': 'The art of going to Switzerland for rehab, flying back, and realizing you forgot to rehab.'
  }
};

module.exports = {
  blaking: blaking,
  chain: chain,
  commands: commands,
  fireTrading: fireTrading,
  image: image,
  itemInfo: itemInfo,
  lottoCancelMsg: lottoCancelMsg,
  lottoDrawMsg: lottoDrawMsg,
  lottoInfo: lottoInfo,
  lottoJoinMsg: lottoJoinMsg,
  lottoStartMsg: lottoStartMsg,
  phrase: phrase,
  rpsStartMsg: rpsStartMsg,
  rpsEndMsg: rpsEndMsg,
  stat: stat
};
