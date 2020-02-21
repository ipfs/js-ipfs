'use strict'

module.exports = {
  command: 'list',

  describe: 'Show peers in the bootstrap list',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const list = await ipfs.bootstrap.list()
      list.Peers.forEach((node) => argv.print(node))
    })())
  }
}
