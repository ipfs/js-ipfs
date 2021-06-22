'use strict'

module.exports = {
  command: 'bootstrap <command>',

  description: 'Show or edit the list of bootstrap peers.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      .commandDir('bootstrap')
  }
}
