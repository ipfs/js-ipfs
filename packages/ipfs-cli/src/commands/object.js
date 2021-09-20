import { commands } from './object/index.js'

export default {
  command: 'object <command>',

  description: 'Interact with ipfs objects.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
  }
}
