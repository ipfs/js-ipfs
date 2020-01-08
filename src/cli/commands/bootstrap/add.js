'use strict'

module.exports = {
  command: 'add [<peer>]',

  describe: 'Add peers to the bootstrap list',

  builder: {
    default: {
      describe: 'Add default bootstrap nodes.',
      type: 'boolean',
      default: false
    }
  },

  async handler (argv) {
    const list = await argv.ipfs.api.bootstrap.add(argv.peer, { default: argv.default })
    list.Peers.forEach((peer) => argv.print(peer))
  }
}
