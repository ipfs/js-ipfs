'use strict'
const print = require('../utils').print

module.exports = {
  command: 'dns <domain>',

  describe: 'Resolve DNS links',

  builder: {
    format: {
      type: 'string'
    }
  },

  handler ({ getIpfs, domain, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const path = await ipfs.dns(domain)
      print(path)
    })())
  }
}
