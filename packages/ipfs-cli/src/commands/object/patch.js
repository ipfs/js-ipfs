'use strict'

module.exports = {
  command: 'patch',

  description: 'Create a new merkledag object based on an existing one.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      .commandDir('patch')
  }
}
