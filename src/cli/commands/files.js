'use strict'

const print = require('../utils').print
const lsCmd = require('./ls')

module.exports = {
  command: 'files <command>',

  description: 'Operations over files (add, cat, get, ls, etc)',

  builder (yargs) {
    return yargs
      .commandDir('files')
      .command(lsCmd)
  },

  handler (argv) {
    print('Type `jsipfs files --help` for more instructions')
  }
}
