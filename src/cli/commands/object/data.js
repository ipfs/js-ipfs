'use strict'

module.exports = {
  command: 'data <key>',

  describe: 'Outputs the raw bytes in an IPFS object',

  async handler (argv) {
    const data = await argv.ipfs.api.object.data(argv.key, { enc: 'base58' })
    argv.print(data, false)
  }
}
