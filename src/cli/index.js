'use strict'

const {
  print
} = require('./utils')

const command = {
  command: 'files <command>',

  description: 'Operations over mfs files (ls, mkdir, rm, etc)',

  builder (yargs) {
    return yargs.commandDir('.')
  },

  handler (argv) {
    print('Type `jsipfs files --help` for more instructions')
  }
}

module.exports = (yargs) => {
  return yargs
    .command(command)
}
