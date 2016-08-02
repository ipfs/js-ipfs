'use strict'

module.exports = {
  command: 'bootstrap',

  description: 'Show or edit the list of bootstrap peers.',

  builder (yargs) {
    return yargs
      .commandDir('bootstrap')
  },

  handler (argv) {
  }
}
