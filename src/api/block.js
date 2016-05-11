'use strict'

const argCommand = require('../cmd-helpers').argCommand

module.exports = (send) => {
  return {
    get: argCommand(send, 'block/get'),
    stat: argCommand(send, 'block/stat'),
    put (file, cb) {
      if (Array.isArray(file)) {
        let err = new Error('block.put() only accepts 1 file')
        if (typeof cb !== 'function' && typeof Promise !== 'undefined') {
          return new Promise((resolve, reject) => reject(err))
        }
        return cb(err)
      }
      return send('block/put', null, null, file, cb)
    }
  }
}
