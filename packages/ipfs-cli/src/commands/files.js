import { commands } from './files/index.js'

export default {
  command: 'files <command>',

  description: 'Operations over mfs files (ls, mkdir, rm, etc)',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    // @ts-expect-error types are wrong
    return yargs.command(commands)
  },

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   */
  handler (argv) {
    argv.ctx.print('Type `jsipfs files --help` for more instructions')
  }
}
