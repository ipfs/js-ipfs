'use strict'

module.exports = {
  command: 'bitswap <command>',

  description: 'Interact with the bitswap agent.',

  builder (yargs) {
    return yargs.commandDir('bitswap')
  },

  handler (argv) {
  }
}
