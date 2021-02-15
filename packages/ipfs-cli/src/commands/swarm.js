'use strict'

module.exports = {
  command: 'swarm <command>',

  description: 'Swarm inspection tool.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      .commandDir('swarm')
  }
}
