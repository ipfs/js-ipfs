'use strict'

const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')
const print = require('../../../utils').print
const {
  util: {
    cid
  }
} = require('ipld-dag-pb')

module.exports = {
  command: 'rm-link <root> <link>',

  describe: 'Remove a link from an object',

  builder: {
    'cid-base': {
      default: 'base58btc',
      describe: 'CID base to use.'
    }
  },

  handler (argv) {
    argv.ipfs.object.patch.rmLink(argv.root, { name: argv.link }, {
      enc: 'base58'
    }, (err, node) => {
      if (err) {
        throw err
      }

      cid(node, (err, cid) => {
        if (err) {
          throw err
        }

        print(cid.toBaseEncodedString(argv.cidBase))
      })
    })
  }
}
