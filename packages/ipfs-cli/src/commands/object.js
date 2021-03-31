'use strict'

module.exports = {
  command: 'object <command>',

  description: 'Interact with ipfs objects.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      .commandDir('object')
  }
}
