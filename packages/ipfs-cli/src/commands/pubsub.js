'use strict'

module.exports = {
  command: 'pubsub <command>',

  description: 'pubsub commands',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      .commandDir('pubsub')
  }
}
