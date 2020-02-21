'use strict'

const JSONDiff = require('jsondiffpatch')

module.exports = {
  command: 'apply <profile>',

  describe: 'Apply profile to config',

  builder: {
    'dry-run': {
      type: 'boolean',
      describe: 'print difference between the current config and the config that would be generated.'
    }
  },

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const diff = await ipfs.config.profiles.apply(argv.profile, { dryRun: argv.dryRun })
      const delta = JSONDiff.diff(diff.original, diff.updated)
      const res = JSONDiff.formatters.console.format(delta, diff.original)

      if (res) {
        argv.print(res)

        if (argv.isDaemonOn()) {
          argv.print('\nThe IPFS daemon is running in the background, you may need to restart it for changes to take effect.')
        }
      } else {
        argv.print(`IPFS config already contains the settings from the '${argv.profile}' profile`)
      }
    })())
  }
}
