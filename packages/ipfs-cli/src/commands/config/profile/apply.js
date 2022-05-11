import JSONDiff from 'jsondiffpatch'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../../types').Context} Argv.ctx
 * @property {string} Argv.profile
 * @property {boolean} Argv.dryRun
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'apply <profile>',

  describe: 'Apply profile to config',

  builder: {
    'dry-run': {
      boolean: true,
      describe: 'print difference between the current config and the config that would be generated',
      default: false
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx, profile, dryRun, timeout }) {
    const { print, ipfs, isDaemon } = ctx
    const diff = await ipfs.config.profiles.apply(profile, {
      dryRun,
      timeout
    })
    const delta = JSONDiff.diff(diff.original, diff.updated)
    const res = delta && JSONDiff.formatters.console.format(delta, diff.original)

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

export default command
