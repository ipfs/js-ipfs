'use strict'

const argCommand = require('../cmd-helpers').argCommand

module.exports = (send) => {
  return {
    wantlist (cb) {
      return send('bitswap/wantlist', {}, null, null, cb)
    },
    stat (cb) {
      return send('bitswap/stat', {}, null, null, cb)
    },
    unwant: argCommand(send, 'bitswap/unwant')
  }
}
