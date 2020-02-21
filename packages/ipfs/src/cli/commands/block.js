'use strict'

module.exports = {
  command: 'block <command>',

  description: 'Manipulate raw IPFS blocks.',

  builder (yargs) {
    return yargs
      .commandDir('block')
  },

  handler (argv) {
  }
}
