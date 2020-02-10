'use strict'

module.exports = {
  command: 'data <key>',

  describe: 'Outputs the raw bytes in an IPFS object',

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    const data = await ipfs.object.data(argv.key, { enc: 'base58' })
    print(data, false)
  }
}
