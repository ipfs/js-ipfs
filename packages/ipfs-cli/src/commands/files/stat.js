import {
  asBoolean
} from '../../utils.js'
import { formatMode } from 'ipfs-core-utils/files/format-mode'
import { formatMtime } from 'ipfs-core-utils/files/format-mtime'
import parseDuration from 'parse-duration'

export default {
  command: 'stat [path]',

  describe: 'Display file/directory status',

  builder: {
    format: {
      alias: 'f',
      type: 'string',
      default: `<hash>
Size: <size>
CumulativeSize: <cumulsize>
ChildBlocks: <childs>
Type: <type>
Mode: <mode>
Mtime: <mtime>`,
      describe: 'Print statistics in given format. Allowed tokens: <hash> <size> <cumulsize> <type> <childs> <mode> <mtime>. Conflicts with other format options.'
    },
    hash: {
      alias: 'h',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Print only hash. Implies \'--format=<hash>\'. Conflicts with other format options.'
    },
    size: {
      alias: 's',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Print only size. Implies \'--format=<cumulsize>\'. Conflicts with other format options.'
    },
    'with-local': {
      alias: 'l',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Compute the amount of the dag that is local, and if possible the total size'
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
   * @param {string} argv.format
   * @param {boolean} argv.hash
   * @param {boolean} argv.size
   * @param {boolean} argv.withLocal
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({
    ctx: { ipfs, print },
    path,
    format,
    hash,
    size,
    withLocal,
    cidBase,
    timeout
  }) {
    const stats = await ipfs.files.stat(path, {
      withLocal,
      timeout
    })
    const base = await ipfs.bases.getBase(cidBase)

    if (hash) {
      return print(stats.cid.toString(base.encoder))
    }

    if (size) {
      return print(`${stats.size}`)
    }

    print(format
      .replace('<hash>', stats.cid.toString(base.encoder))
      .replace('<size>', `${stats.size}`)
      .replace('<cumulsize>', `${stats.cumulativeSize}`)
      .replace('<childs>', `${stats.blocks}`)
      .replace('<type>', stats.type)
      .replace('<mode>', stats.mode ? formatMode(stats.mode, stats.type === 'directory') : '')
      .replace('<mtime>', stats.mtime ? formatMtime(stats.mtime) : '')
    )
  }
}
