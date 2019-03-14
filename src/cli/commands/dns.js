'use strict'
const print = require('../utils').print

module.exports = {
  command: 'dns <domain>',

  describe: 'Resolve DNS links',

  builder: {
    recursive: {
      type: 'boolean',
      default: false,
      alias: 'r',
      desc: 'Resolve until the result is not a DNS link'
    },
    format: {
      type: 'string'
    }
  },

  handler ({ getIpfs, domain, resolve, ...opts }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const path = await ipfs.dns(domain, opts)
      print(path)
    })())
  }
}
