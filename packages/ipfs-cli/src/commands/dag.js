'use strict'

module.exports = {
  command: 'dag <command>',

  description: 'Interact with ipld dag objects.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      .commandDir('dag')
  }
}
