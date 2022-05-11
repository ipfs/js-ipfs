import { rightpad, stripControlCharacters } from '../utils.js'
import { formatMode } from 'ipfs-core-utils/files/format-mode'
import { formatMtime } from 'ipfs-core-utils/files/format-mtime'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {string} Argv.key
 * @property {boolean} Argv.headers
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'ls <key>',

  describe: 'List files for the given directory',

  builder: {
    v: {
      alias: 'headers',
      desc: 'Print table headers (Hash, Size, Name)',
      boolean: true,
      default: false
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

  async handler ({ ctx: { ipfs, print }, key, headers, cidBase, timeout }) {
    // replace multiple slashes
    key = key.replace(/\/(\/+)/g, '/')

    // strip trailing slash
    if (key.endsWith('/')) {
      key = key.replace(/(\/+)$/, '')
    }

    let pathParts = key.split('/')

    if (key.startsWith('/ipfs/')) {
      pathParts = pathParts.slice(2)
    }

    let first = true

    /** @type {number[]} */
    let maxWidths = []
    /**
     * @param  {...string} args
     */
    const getMaxWidths = (...args) => {
      maxWidths = args.map((v, i) => Math.max(maxWidths[i] || 0, v.length))
      return maxWidths
    }

    /**
     * @param {*} mode
     * @param {*} mtime
     * @param {*} cid
     * @param {*} size
     * @param {*} name
     * @param {*} depth
     */
    const printLink = (mode, mtime, cid, size, name, depth = 0) => {
      name = stripControlCharacters(name)
      const widths = getMaxWidths(mode, mtime, cid, size, name)
      // todo: fix this by resolving https://github.com/ipfs/js-ipfs-unixfs-exporter/issues/24
      const padding = Math.max(depth - pathParts.length, 0)
      print(
        rightpad(mode, widths[0] + 1) +
          rightpad(mtime, widths[1] + 1) +
          rightpad(cid, widths[2] + 1) +
          rightpad(size, widths[3] + 1) +
          '  '.repeat(padding) + name
      )
    }

    const base = await ipfs.bases.getBase(cidBase)

    for await (const link of ipfs.ls(key, { timeout })) {
      const mode = link.mode != null ? formatMode(link.mode, link.type === 'dir') : ''
      const mtime = link.mtime != null ? formatMtime(link.mtime) : '-'
      const cid = link.cid.toString(base.encoder)
      const size = link.size ? String(link.size) : '-'
      const name = stripControlCharacters(link.type === 'dir' ? `${link.name || ''}/` : link.name)

      if (first) {
        first = false
        if (headers) {
          // Seed max widths for the first item
          getMaxWidths(mode, mtime, cid, size, name)
          printLink('Mode', 'Mtime', 'Hash', 'Size', 'Name')
        }
      }

      printLink(mode, mtime, cid, size, name)
    }
  }
}

export default command
