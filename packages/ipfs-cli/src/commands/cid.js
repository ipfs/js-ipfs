'use strict'

const path = require('path')

const cidCommandsPath = path.join(
  path.dirname(require.resolve('cid-tool')), 'cli', 'commands'
)

module.exports = {
  command: 'cid <command>',

  description: 'Convert, format and discover properties of CIDs.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      .commandDir(cidCommandsPath)
  }
}
