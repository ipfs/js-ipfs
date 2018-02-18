'use strict'

module.exports = function stats (self) {
  return {
    bitswap: require('./bitswap')(self).stat,
    repo: require('./repo')(self).stat
  }
}
