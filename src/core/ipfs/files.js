'use strict'

const importer = require('ipfs-data-importing').import

module.exports = function libp2p (self) {
  return {
    add: (path, options, callback) => {
      options.path = path
      options.dagService = self._dagS
      importer(options, callback)
    }
  }
}
