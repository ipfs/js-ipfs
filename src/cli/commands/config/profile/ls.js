'use strict'

const { profiles } = require('../../../../core/components/config')

module.exports = {
  command: 'ls',

  describe: 'List available config profiles',

  builder: {},

  handler (argv) {
    argv.resolve(
      Object.keys(profiles)
        .map(profile => `${profile}:\n ${profiles[profile].description}`)
        .join('\n')
    )
  }
}
