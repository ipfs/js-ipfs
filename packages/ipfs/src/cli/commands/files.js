'use strict'

module.exports = {
  command: 'files <command>',

  description: 'Operations over mfs files (ls, mkdir, rm, etc)',

  builder (yargs) {
    return yargs.commandDir('files')
  },

  handler (argv) {
    argv.print('Type `jsipfs files --help` for more instructions')
  }
}
