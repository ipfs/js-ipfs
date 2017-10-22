'use strict'

module.exports = {
  command: 'pin',

  description: 'Pin and unpin objects to local storage.',

  builder (yargs) {
    return yargs
      .commandDir('pin')
  },

  handler (argv) {
  }
}
