import {
  asBoolean,
  stripControlCharacters
} from '../../utils.js'
import { formatMode } from 'ipfs-core-utils/files/format-mode'
import { formatMtime } from 'ipfs-core-utils/files/format-mtime'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.path
 * @property {boolean} Argv.long
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'ls [path]',

  describe: 'List mfs directories',

  builder: {
    long: {
      alias: 'l',
      boolean: true,
      default: false,
      coerce: asBoolean,
      describe: 'Use long listing format.'
    },
    'cid-base': {
      describe: 'CID base to use',
      default: 'base58btc'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({
    ctx: { ipfs, print },
    path,
    long,
    cidBase,
    timeout
  }) {
    const base = await ipfs.bases.getBase(cidBase)

    /**
     * @param {import('ipfs-core-types/src/files').MFSEntry} file
     */
    const printListing = file => {
      const name = stripControlCharacters(file.name)

      if (long) {
        print(`${file.mode ? formatMode(file.mode, file.type === 'directory') : ''}\t${file.mtime ? formatMtime(file.mtime) : ''}\t${name}\t${file.cid.toString(base.encoder)}\t${file.size}`)
      } else {
        print(name)
      }
    }

    for await (const file of ipfs.files.ls(path || '/', {
      timeout
    })) {
      printListing(file)
    }
  }
}

export default command
