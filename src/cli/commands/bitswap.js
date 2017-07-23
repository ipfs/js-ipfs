'use strict'

module.exports = {
  command: 'bitswap',

  description: 'Interact with the bitswap agent.',

  builder (yargs) {
    return yargs.commandDir('bitswap')
  },

  handler (argv) {
    console.log('Type `jsipfs bitswap --help` for more information about this command')
  }
}
