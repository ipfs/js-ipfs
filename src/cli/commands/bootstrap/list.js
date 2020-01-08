'use strict'

module.exports = {
  command: 'list',

  describe: 'Show peers in the bootstrap list',

  builder: {},

  async handler ({ ipfs, print }) {
    const list = await ipfs.api.bootstrap.list()
    list.Peers.forEach((node) => print(node))
  }
}
