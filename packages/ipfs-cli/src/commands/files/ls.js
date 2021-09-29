import {
  asBoolean,
  stripControlCharacters
} from '../../utils.js'
import { formatMode } from 'ipfs-core-utils/files/format-mode'
import { formatMtime } from 'ipfs-core-utils/files/format-mtime'
import parseDuration from 'parse-duration'

export default {
  command: 'ls [path]',

  describe: 'List mfs directories',

  builder: {
    long: {
      alias: 'l',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Use long listing format.'
    },
    'cid-base': {
      describe: 'CID base to use.',
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
   * @param {string} argv.path
   * @param {boolean} argv.long
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
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
