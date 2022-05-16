import prettyBytes from 'pretty-bytes'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {boolean} Argv.human
 * @property {boolean} Argv.sizeOnly
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'stat',

  describe: 'Get stats for the currently used repo',

  builder: {
    human: {
      boolean: true,
      alias: 'H',
      default: false
    },
    sizeOnly: {
      boolean: true,
      alias: 's',
      default: false
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, human, sizeOnly, timeout }) {
    const stats = await ipfs.repo.stat({
      timeout
    })

    /** @type {Record<string, any>} */
    const output = {
      ...stats
    }

    if (human) {
      output.numObjects = Number(stats.numObjects)
      output.repoSize = prettyBytes(Number(stats.repoSize)).toUpperCase()
      output.storageMax = prettyBytes(Number(stats.storageMax)).toUpperCase()
    }

    if (sizeOnly) {
      print(
        `RepoSize:   ${output.repoSize}
StorageMax: ${output.storageMax}`)
    } else {
      print(`NumObjects: ${output.numObjects}
RepoSize:   ${output.repoSize}
StorageMax: ${output.storageMax}
RepoPath:   ${output.repoPath}
Version:    ${output.version}`)
    }
  }
}

export default command
