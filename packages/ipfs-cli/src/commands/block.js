'use strict'

module.exports = {
  command: 'block <command>',

  description: 'Manipulate raw IPFS blocks.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      .commandDir('block')
  }
}
