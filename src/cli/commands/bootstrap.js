'use strict'

module.exports = {
  command: 'bootstrap <command>',

  description: 'Show or edit the list of bootstrap peers.',

  builder (yargs) {
    return yargs
      .commandDir('bootstrap')
  },

  handler (argv) {
  }
}
