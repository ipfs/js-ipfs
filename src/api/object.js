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
    patch: {
      rmLink: (root, link, cb) => {
        return send('object/patch/rm-link', [root, link], null, null, cb)
      },
      setData: (root, data, cb) => {
        return send('object/patch/set-data', [root], null, data, cb)
      },
      appendData: (root, data, cb) => {
        return send('object/patch/append-data', [root], null, data, cb)
      },
      addLink: (root, name, ref, cb) => {
        return send('object/patch/add-link', [root, name, ref], null, null, cb)
      }
    }
  }
}
