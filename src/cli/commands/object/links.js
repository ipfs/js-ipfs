'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'links <key>',

  describe: 'Outputs the links pointed to by the specified object',

  builder: {
    'cid-base': {
      default: 'base58btc',
      describe: 'CID base to use.'
    }
  },

  handler (argv) {
    argv.ipfs.object.links(argv.key, {
      enc: 'base58'
    }, (err, links) => {
      if (err) {
        throw err
      }

      links.forEach((link) => {
        print(`${link.cid.toBaseEncodedString(argv.cidBase)} ${link.size} ${link.name}`)
      })
    })
  }
}
