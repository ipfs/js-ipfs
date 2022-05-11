import { commands } from './cid/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'cid <command>',

  describe: 'Convert, format and discover properties of CIDs',

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
