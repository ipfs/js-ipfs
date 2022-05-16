import { commands } from './dht/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'dht <command>',

  describe: 'Issue commands directly through the DHT',

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
