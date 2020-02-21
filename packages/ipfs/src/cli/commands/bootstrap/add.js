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

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const list = await ipfs.bootstrap.add(argv.peer, { default: argv.default })
      list.Peers.forEach((peer) => argv.print(peer))
    })())
  }
}
