'use strict'

module.exports = {
  command: 'patch',

  description: 'Create a new merkledag object based on an existing one.',

  builder (yargs) {
    return yargs
      .commandDir('patch')
  },

  handler (argv) {
  }
}
