'use strict'

module.exports = {
  command: 'pin <command>',

  description: 'Pin and unpin objects to local storage.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      .commandDir('pin')
  }
}
