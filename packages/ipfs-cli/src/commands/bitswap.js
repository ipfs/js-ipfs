import { commands } from './bitswap/index.js'

export default {
  command: 'bitswap <command>',

  description: 'Interact with the bitswap agent.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    // @ts-expect-error types are wrong
    return yargs.command(commands)
  }
}
