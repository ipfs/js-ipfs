'use strict'

module.exports = {
  command: 'block',

  description: 'Manipulate raw IPFS blocks.',

  builder (yargs) {
    return yargs
      .commandDir('block')
  },

  handler (argv) {
  }
}
