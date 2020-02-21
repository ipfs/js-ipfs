'use strict'

module.exports = {
  command: 'object <command>',

  description: 'Interact with ipfs objects.',

  builder (yargs) {
    return yargs
      .commandDir('object')
  },

  handler (argv) {
  }
}
