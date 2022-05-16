import {
  asBoolean
} from '../../utils.js'
import { formatMode } from 'ipfs-core-utils/files/format-mode'
import { formatMtime } from 'ipfs-core-utils/files/format-mtime'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.path
 * @property {string} Argv.format
 * @property {boolean} Argv.hash
 * @property {boolean} Argv.size
 * @property {boolean} Argv.withLocal
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'stat [path]',

  describe: 'Display file/directory status',

  builder: {
    format: {
      alias: 'f',
      string: true,
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
      boolean: true,
      default: false,
      coerce: asBoolean,
      describe: 'Print only hash. Implies \'--format=<hash>\'. Conflicts with other format options.'
    },
    size: {
      alias: 's',
      boolean: true,
      default: false,
      coerce: asBoolean,
      describe: 'Print only size. Implies \'--format=<cumulsize>\'. Conflicts with other format options.'
    },
    'with-local': {
      alias: 'l',
      boolean: true,
      default: false,
      coerce: asBoolean,
      describe: 'Compute the amount of the dag that is local, and if possible the total size'
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

export default command
