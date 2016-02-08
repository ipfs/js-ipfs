'use strict'

const argCommand = require('../cmd-helpers').argCommand

module.exports = (send) => {
  return {
    get: argCommand(send, 'object/get'),
    put (file, encoding, cb) {
      if (typeof encoding === 'function') {
        return cb(null, new Error("Must specify an object encoding ('json' or 'protobuf')"))
      }
      return send('object/put', encoding, null, file, cb)
    },
    data: argCommand(send, 'object/data'),
    links: argCommand(send, 'object/links'),
    stat: argCommand(send, 'object/stat'),
    new: argCommand(send, 'object/new'),
    patch (file, opts, cb) {
      return send('object/patch', [file].concat(opts), null, null, cb)
    }
  }
}
