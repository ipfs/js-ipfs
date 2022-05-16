import { commands } from './block/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'block <command>',

  describe: 'Manipulate raw IPFS blocks',

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
