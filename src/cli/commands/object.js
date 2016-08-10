'use strict'

module.exports = {
  command: 'object',

  description: 'Interact with ipfs objects.',

  builder (yargs) {
    return yargs
      .commandDir('object')
  },

  handler (argv) {
  }
}
