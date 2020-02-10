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

  async handler ({ ctx, domain, recursive, format }) {
    const { ipfs, print } = ctx

    const path = await ipfs.dns(domain, { recursive, format })
    print(path)
  }
}
