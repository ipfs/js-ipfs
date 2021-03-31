'use strict'

module.exports = {
  command: 'files <command>',

  description: 'Operations over mfs files (ls, mkdir, rm, etc)',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs.commandDir('files')
  },

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   */
  handler (argv) {
    argv.ctx.print('Type `jsipfs files --help` for more instructions')
  }
}
