'use strict'

module.exports = {
  command: 'repo',

  description: 'Manipulate the IPFS repo.',

  builder (yargs) {
    return yargs
      .commandDir('repo')
  },

  handler (argv) {
  }
}
