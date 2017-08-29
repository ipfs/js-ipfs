'use strict'

module.exports = {
  command: 'files',

  description: 'Operations over files (add, cat, get, ls, etc)',

  builder (yargs) {
    return yargs
      .commandDir('files')
  },

  handler (argv) {
    console.log('Type `jsipfs bitswap --help` for more instructions')
  }
}
