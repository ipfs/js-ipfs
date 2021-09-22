import { commands } from './repo/index.js'

export default {
  command: 'repo <command>',

  description: 'Manipulate the IPFS repo.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
  }
}
