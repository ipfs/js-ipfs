'use strict'

const print = require('../utils').print


module.exports = {
  command: 'files <command>',

  description: 'Operations over files (add, cat, get, ls, etc)',

  builder (yargs) {
    return yargs
      .commandDir('files')
  },

  handler (argv) {
    print('Type `jsipfs files --help` for more instructions')
  }
}
