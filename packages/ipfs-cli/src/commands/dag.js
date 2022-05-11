import { commands } from './dag/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'dag <command>',

  describe: 'Interact with ipld dag objects',

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
