import { commands } from './block/index.js'

export default {
  command: 'block <command>',

  description: 'Manipulate raw IPFS blocks.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
  }
}
