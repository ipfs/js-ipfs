'use strict'

module.exports = {
  command: 'files',

  description: 'Unixfs commands',

  builder (yargs) {
    return yargs
      .commandDir('files')
  },

  handler (argv) {}
}
