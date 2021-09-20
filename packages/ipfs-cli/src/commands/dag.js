import { commands } from './dag/index.js'

export default {
  command: 'dag <command>',

  description: 'Interact with ipld dag objects.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
  }
}
