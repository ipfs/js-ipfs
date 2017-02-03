'use strict'

module.exports = {
  command: 'dag',

  description: 'Interact with ipld dag objects.',

  builder (yargs) {
    return yargs
      .commandDir('dag')
  },

  handler (argv) {
  }
}
