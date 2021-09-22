import { commands } from './pubsub/index.js'

export default {
  command: 'pubsub <command>',

  description: 'pubsub commands',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
  }
}
