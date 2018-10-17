'use strict'

const path = require('path')

const cidCommandsPath = path.join(
  __dirname, '..', '..', '..', 'node_modules', 'cid-tool', 'src', 'cli', 'commands'
)

module.exports = {
  command: 'cid <command>',

  description: 'Convert, format and discover properties of CIDs.',

  builder (yargs) {
    return yargs
      .commandDir(cidCommandsPath)
  },

  handler (argv) {
  }
}
