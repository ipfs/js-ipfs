import prettyBytes from 'pretty-bytes'
import parseDuration from 'parse-duration'

export default {
  command: 'stat',

  describe: 'Get stats for the currently used repo',

  builder: {
    human: {
      type: 'boolean',
      alias: 'H',
      default: false
    },
    sizeOnly: {
      type: 'boolean',
      alias: 's',
      default: false
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {boolean} argv.human
   * @param {boolean} argv.sizeOnly
   * @param {number} argv.timeout
   */
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
