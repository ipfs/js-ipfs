'use strict'

module.exports = {
  command: 'list',

  describe: 'Show peers in the bootstrap list',

  builder: {},

  async handler (argv) {
    const { ipfs, print } = argv.ctx
    const list = await ipfs.bootstrap.list()
    list.Peers.forEach((node) => print(node))
  }
}
