import { commands } from './stats/index.js'

export default {
  command: 'stats <command>',

  description: 'Query IPFS statistics.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    // @ts-expect-error types are wrong
    return yargs.command(commands)
  }
}
