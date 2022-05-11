import parseDuration from 'parse-duration'
import {
  makeEntriesPrintable
} from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string[]} Argv.ipfsPath
 * @property {'direct' | 'indirect' | 'recursive' | 'all'} Argv.type
 * @property {boolean} Argv.quiet
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  // bracket syntax with '...' tells yargs to optionally accept a list
  command: 'ls [ipfsPath...]',

  describe: 'List objects pinned to local storage',

  builder: {
    type: {
      string: true,
      alias: 't',
      default: 'all',
      choices: ['direct', 'indirect', 'recursive', 'all'],
      describe: 'The type of pinned keys to list.'
    },
    quiet: {
      boolean: true,
      alias: 'q',
      default: false,
      describe: 'Write just hashes of objects.'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in',
      string: true,
      default: 'base58btc'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

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

export default command
