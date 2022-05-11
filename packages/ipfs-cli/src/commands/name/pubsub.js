import { commands } from './pubsub/index.js'

/**
 * @typedef {import('yargs').Argv} Argv
 */

/*
Manage and inspect the state of the IPNS pubsub resolver.
Note: this command is experimental and subject to change as the system is refined.
*/
/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'pubsub',

  describe: 'IPNS pubsub management',

  builder (yargs) {
    commands.forEach(command => {
      yargs.command(command)
    })

    return yargs
  },

  handler () {

  }
}

export default command
