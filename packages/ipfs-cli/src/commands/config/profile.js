import { commands } from './profile/index.js'

/**
 * @typedef {import('yargs').Argv<{}>} Argv
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'profile <command>',

  describe: 'Interact with config profiles',

  builder (yargs) {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
  },

  handler () {

  }
}

export default command
