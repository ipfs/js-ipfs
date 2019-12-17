'use strict'

const multibase = require('multibase')
const { rightpad } = require('../utils')
const { cidToString } = require('../../utils/cid')
const formatMode = require('ipfs-utils/src/files/format-mode')
const formatMtime = require('ipfs-utils/src/files/format-mtime')

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
      choices: multibase.names
    }
  },

  handler ({ getIpfs, print, key, recursive, headers, cidBase, resolve }) {
    resolve((async () => {
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

      const ipfs = await getIpfs()
      let first = true

      const widths = {
        cid: 0,
        size: 0,
        mtime: 0,
        mode: 0
      }

      const printLink = (mode, mtime, cid, size, name, depth = 0) => {
        // todo: fix this by resolving https://github.com/ipfs/js-ipfs-unixfs-exporter/issues/24
        const padding = Math.max(depth - pathParts.length, 0)
        print(
          rightpad(mode, 11) +
          rightpad(mtime || '-', widths.mtime + 1) +
          rightpad(cid, widths.cid + 1) +
          rightpad(size || '-', widths.size + 1) +
          '  '.repeat(padding) + name
        )
      }

      for await (const link of ipfs.ls(key, { recursive })) {
        const mode = formatMode(link.mode, link.type === 'dir')
        const mtime = formatMtime(link.mtime)
        const cid = cidToString(link.cid, { base: cidBase })
        const name = link.type === 'dir' ? `${link.name || ''}/` : link.name

        widths.mode = Math.max(widths.mode, mode)
        widths.mtime = Math.max(widths.mtime, mtime)
        widths.cid = Math.max(widths.cid, cid.length)
        widths.size = Math.max(widths.size, String(link.size).length)

        if (first) {
          first = false
          if (headers) {
            widths.mode = Math.max(widths.mode, 'Mode'.length)
            widths.mtime = Math.max(widths.mtime, 'Mtime'.length)
            widths.cid = Math.max(widths.cid, 'Hash'.length)
            widths.size = Math.max(widths.size, 'Size'.length)
            printLink('Mode', 'Mtime', 'Hash', 'Size', 'Name')
          }
        }

        printLink(mode, mtime, cid, link.size, name, link.depth)
      }
    })())
  }
}
