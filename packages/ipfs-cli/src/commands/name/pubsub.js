import { commands } from './pubsub/index.js'

/*
Manage and inspect the state of the IPNS pubsub resolver.
Note: this command is experimental and subject to change as the system is refined.
*/
export default {
  command: 'pubsub',

  description: 'IPNS pubsub management.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    // @ts-expect-error types are wrong
    return yargs.command(commands)
  }
}
