'use strict'

const JSONDiff = require('jsondiffpatch')

module.exports = {
  command: 'apply <profile>',

  describe: 'Apply profile to config',

  builder: {
    'dry-run': {
      type: 'boolean',
      describe: 'print difference between the current config and the config that would be generated.',
      default: false
    }
  },

  async handler ({ ctx, profile, dryRun }) {
    const { print, ipfs, isDaemon } = ctx
    const diff = await ipfs.config.profiles.apply(profile, { dryRun })
    const delta = JSONDiff.diff(diff.original, diff.updated)
    const res = JSONDiff.formatters.console.format(delta, diff.original)

    if (res) {
      print(res)

      if (isDaemon) {
        print('\nThe IPFS daemon is running in the background, you may need to restart it for changes to take effect.')
      }
    } else {
      print(`IPFS config already contains the settings from the '${profile}' profile`)
    }
  }
}
