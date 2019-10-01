'use strict'

const { profiles } = require('../../../../core/components/config')

module.exports = {
  command: 'ls',

  describe: 'List available config profiles',

  builder: {},

  handler (argv) {
    argv.resolve(
      profiles.map(p => p.name + ':\n  ' + p.description).join('\n')
    )
  }
}
