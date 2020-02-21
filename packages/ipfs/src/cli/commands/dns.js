'use strict'

module.exports = {
  command: 'dns <domain>',

  describe: 'Resolve DNS links',

  builder: {
    recursive: {
      type: 'boolean',
      default: true,
      alias: 'r',
      desc: 'Resolve until the result is not a DNS link'
    },
    format: {
      type: 'string'
    }
  },

  handler ({ getIpfs, print, domain, resolve, recursive, format }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const path = await ipfs.dns(domain, { recursive, format })
      print(path)
    })())
  }
}
