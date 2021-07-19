'use strict'

module.exports = {
  command: 'cid <command>',

  description: 'Convert, format and discover properties of CIDs.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs.commandDir('cid')
  }
}
