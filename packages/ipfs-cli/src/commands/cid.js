import { commands } from './cid/index.js'

export default {
  command: 'cid <command>',

  description: 'Convert, format and discover properties of CIDs.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    // @ts-expect-error types are wrong
    return yargs.command(commands)
  }
}
