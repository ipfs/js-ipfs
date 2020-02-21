'use strict'

module.exports = {
  command: 'data <key>',

  describe: 'Outputs the raw bytes in an IPFS object',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const data = await ipfs.object.data(argv.key, { enc: 'base58' })
      argv.print(data, false)
    })())
  }
}
