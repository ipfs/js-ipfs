'use strict'

module.exports = {
  command: 'profile <command>',

  description: 'Interact with config profiles.',

  builder (yargs) {
    return yargs
      .commandDir('profile')
  },

  handler (argv) {
  }
}
