import parseDuration from 'parse-duration'
import {
  makeEntriesPrintable
} from '../../utils.js'

export default {
  // bracket syntax with '...' tells yargs to optionally accept a list
  command: 'ls [ipfsPath...]',

  describe: 'List objects pinned to local storage.',

  builder: {
    type: {
      type: 'string',
      alias: 't',
      default: 'all',
      choices: ['direct', 'indirect', 'recursive', 'all'],
      describe: 'The type of pinned keys to list.'
    },
    quiet: {
      type: 'boolean',
      alias: 'q',
      default: false,
      describe: 'Write just hashes of objects.'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      default: 'base58btc'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string[]} argv.ipfsPath
   * @param {'direct' | 'indirect' | 'recursive' | 'all'} argv.type
   * @param {boolean} argv.quiet
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, ipfsPath, type, quiet, cidBase, timeout }) {
    const base = await ipfs.bases.getBase(cidBase)
    /**
     * @param {import('ipfs-core-types/src/pin').LsResult} res
     */
    const printPin = res => {
      let line = res.cid.toString(base.encoder)
      if (!quiet) {
        line += ` ${res.type}`

        if (res.metadata) {
          line += ` ${JSON.stringify(makeEntriesPrintable(res.metadata, base))}`
        }
      }
      print(line)
    }

    for await (const res of ipfs.pin.ls({
      paths: ipfsPath,
      type,
      timeout
    })) {
      printPin(res)
    }
  }
}
