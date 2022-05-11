import { commands } from './pubsub/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'pubsub <command>',

  describe: 'pubsub commands',

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
