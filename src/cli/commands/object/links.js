'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'links <key>',

  describe: 'Outputs the links pointed to by the specified object',

  builder: {},

  handler (argv) {
    argv.ipfs.object.links(argv.key, {
      enc: 'base58'
    }, (err, links) => {
      if (err) {
        throw err
      }

      links.forEach((link) => {
        link = link.toJSON()

        print(`${link.multihash} ${link.size} ${link.name}`)
      })
    })
  }
}
