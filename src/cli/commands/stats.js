'use strict'

module.exports = {
  command: 'stats <command>',

  description: 'Query IPFS statistics.',

  builder (yargs) {
    return yargs.commandDir('stats')
  },

  handler (argv) {
  }
}
