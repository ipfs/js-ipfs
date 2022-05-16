import { commands } from './bootstrap/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'bootstrap <command>',

  describe: 'Show or edit the list of bootstrap peers',

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
