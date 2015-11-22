'use strict'

const argCommand = require('../cmd-helpers').argCommand

module.exports = send => {
  return {
    get: argCommand(send, 'block/get'),
    put (file, cb) {
      if (Array.isArray(file)) {
        return cb(null, new Error('block.put() only accepts 1 file'))
      }
      return send('block/put', null, null, file, cb)
    }
  }
}
