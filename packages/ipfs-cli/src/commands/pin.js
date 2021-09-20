import { commands } from './pin/index.js'

export default {
  command: 'pin <command>',

  description: 'Pin and unpin objects to local storage.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
  }
}
