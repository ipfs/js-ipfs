import { commands } from './files/index.js'

/** @type {import('yargs').CommandModule} */
const command = {
  command: 'files <command>',

  describe: 'Operations over mfs files (ls, mkdir, rm, etc)',

  builder (yargs) {
    commands.forEach(command => {
      yargs.command(command)
    })

    return yargs
  },

  handler ({ ctx: { print } }) {
    print('Type `jsipfs files --help` for more instructions')
  }
}

export default command
