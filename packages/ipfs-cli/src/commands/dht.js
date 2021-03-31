'use strict'

module.exports = {
  command: 'dht <command>',

  description: 'Issue commands directly through the DHT.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs.commandDir('dht')
  }
}
