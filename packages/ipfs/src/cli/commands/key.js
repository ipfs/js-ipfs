'use strict'

module.exports = {
  command: 'key',

  description: 'Manage your keys',

  builder (yargs) {
    return yargs
      .commandDir('key')
  },

  handler (argv) {}
}
