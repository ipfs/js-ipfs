import { commands } from './object/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'object <command>',

  describe: 'Interact with ipfs objects',

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
