'use strict'

module.exports = {
  command: 'profile <command>',

  description: 'Interact with config profiles.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      .commandDir('profile')
  }
}
