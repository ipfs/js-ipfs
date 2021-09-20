import { commands } from './key/index.js'

export default {
  command: 'key <command>',

  description: 'Manage your keys',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
  }
}
