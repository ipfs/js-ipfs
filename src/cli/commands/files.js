'use strict'

module.exports = {
  command: 'files <command>',

  description: 'Operations over files (add, cat, get, ls, etc)',

  builder (yargs) {
    const lsCmd = require('./ls')
    return yargs
      .commandDir('files')
      .command(lsCmd)
  },

  handler (argv) {
    const print = require('../utils').print

    print('Type `jsipfs files --help` for more instructions')
  }
}
