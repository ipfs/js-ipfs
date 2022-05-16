import { commands } from './patch/index.js'

/**
 * @typedef {import('yargs').Argv} Argv
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'patch',

  describe: 'Create a new merkledag object based on an existing one',

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
