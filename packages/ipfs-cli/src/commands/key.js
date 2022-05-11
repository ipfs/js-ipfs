import { commands } from './key/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'key <command>',

  describe: 'Manage your keys',

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
