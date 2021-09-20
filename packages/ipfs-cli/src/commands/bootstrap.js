import { commands } from './bootstrap/index.js'

export default {
  command: 'bootstrap <command>',

  description: 'Show or edit the list of bootstrap peers.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
  }
}
