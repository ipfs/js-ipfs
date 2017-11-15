'use strict'

module.exports = {
  command: 'file',

  description: 'Interact with IPFS objects representing Unix filesystems.',

  builder (yargs) {
    return yargs
      .commandDir('file')
  },

  handler (argv) {
  }
}
