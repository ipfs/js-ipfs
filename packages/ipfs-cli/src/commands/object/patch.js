import { commands } from './patch/index.js'

export default {
  command: 'patch',

  description: 'Create a new merkledag object based on an existing one.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
  }
}
