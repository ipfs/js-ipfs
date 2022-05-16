import { commands } from './pin/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'pin <command>',

  describe: 'Pin and unpin objects to local storage',

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
