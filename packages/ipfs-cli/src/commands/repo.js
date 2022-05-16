import { commands } from './repo/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'repo <command>',

  describe: 'Manipulate the IPFS repo',

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
