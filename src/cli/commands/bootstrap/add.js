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
    argv.ipfs.bootstrap.add(argv.peer, {
      default: argv.default
    }, (err, list) => {
      if (err) {
        throw err
      }

      list.Peers.forEach((l) => console.log(l))
    })
  }
}
