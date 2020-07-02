'use strict'

const multibase = require('multibase')
const { rightpad } = require('../utils')
const { cidToString } = require('../../utils/cid')
const formatMode = require('ipfs-core-utils/src/files/format-mode')
const formatMtime = require('ipfs-core-utils/src/files/format-mtime')
const parseDuration = require('parse-duration').default

module.exports = {
  command: 'ls <key>',

  describe: 'List files for the given directory',

  builder: {
    v: {
      alias: 'headers',
      desc: 'Print table headers (Hash, Size, Name).',
      type: 'boolean',
      default: false
    },
    r: {
      alias: 'recursive',
      desc: 'List subdirectories recursively',
      type: 'boolean',
      default: false
    },
    'resolve-type': {
      desc: 'Resolve linked objects to find out their types. (not implemented yet)',
      type: 'boolean',
      default: false // should be true when implemented
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: Object.keys(multibase.names)
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, key, recursive, headers, cidBase, timeout }) {
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

    let maxWidths = []
    const getMaxWidths = (...args) => {
      maxWidths = args.map((v, i) => Math.max(maxWidths[i] || 0, v.length))
      return maxWidths
    }

    const printLink = (mode, mtime, cid, size, name, depth = 0) => {
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

    for await (const link of ipfs.ls(key, { recursive, timeout })) {
      const mode = formatMode(link.mode, link.type === 'dir')
      const mtime = formatMtime(link.mtime)
      const cid = cidToString(link.cid, { base: cidBase })
      const size = link.size ? String(link.size) : '-'
      const name = link.type === 'dir' ? `${link.name || ''}/` : link.name

      if (first) {
        first = false
        if (headers) {
          // Seed max widths for the first item
          getMaxWidths(mode, mtime, cid, size, name)
          printLink('Mode', 'Mtime', 'Hash', 'Size', 'Name')
        }
      }

      printLink(mode, mtime, cid, size, name, link.depth)
    }
  }
}
