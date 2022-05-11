import { commands } from './stats/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'stats <command>',

  describe: 'Query IPFS statistics',

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
