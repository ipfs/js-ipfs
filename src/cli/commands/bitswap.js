'use strict'

module.exports = {
  command: 'bitswap',

  description: 'A set of commands to manipulate the bitswap agent.',

  builder (yargs) {
    return yargs
      .commandDir('bitswap')
  },

  handler (argv) {
  }
}
