import { commands } from './bitswap/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'bitswap <command>',

  describe: 'Interact with the bitswap agent',

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
