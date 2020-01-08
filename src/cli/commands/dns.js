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

  async handler ({ ipfs, print, domain, recursive, format }) {
    const path = await ipfs.api.dns(domain, { recursive, format })
    print(path)
  }
}
