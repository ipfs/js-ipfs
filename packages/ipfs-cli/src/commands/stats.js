'use strict'

module.exports = {
  command: 'stats <command>',

  description: 'Query IPFS statistics.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs.commandDir('stats')
  }
}
