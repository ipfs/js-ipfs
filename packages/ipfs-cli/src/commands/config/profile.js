import { commands } from './profile/index.js'

export default {
  command: 'profile <command>',

  description: 'Interact with config profiles.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
  }
}
