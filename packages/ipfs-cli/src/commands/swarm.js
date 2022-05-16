import { commands } from './swarm/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'swarm <command>',

  describe: 'Swarm inspection tool',

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
