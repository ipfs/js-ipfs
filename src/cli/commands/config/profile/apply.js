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
      const diff = await ipfs.config.profile(argv.profile, { dryRun: argv.dryRun })
      const delta = JSONDiff.diff(diff.oldCfg, diff.newCfg)
      return JSONDiff.formatters.console.format(delta, diff.oldCfg)
    })())
  }
}
