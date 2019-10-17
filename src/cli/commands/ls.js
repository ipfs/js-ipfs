'use strict'

const multibase = require('multibase')
const { rightpad } = require('../utils')
const { cidToString } = require('../../utils/cid')

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
      const ipfs = await getIpfs()
      let links = await ipfs.ls(key, { recursive })

      links = links.map(file => Object.assign(file, { hash: cidToString(file.hash, { base: cidBase }) }))

      if (headers) {
        links = [{ hash: 'Hash', size: 'Size', name: 'Name' }].concat(links)
      }

      const multihashWidth = Math.max.apply(null, links.map((file) => file.hash.length))
      const sizeWidth = Math.max.apply(null, links.map((file) => String(file.size).length))

      // replace multiple slashes
      key = key.replace(/\/(\/+)/g, '/')

      // strip trailing flash
      if (key.endsWith('/')) {
        key = key.replace(/(\/+)$/, '')
      }

      let pathParts = key.split('/')

      if (key.startsWith('/ipfs/')) {
        pathParts = pathParts.slice(2)
      }

      links.forEach(link => {
        const fileName = link.type === 'dir' ? `${link.name || ''}/` : link.name

        // todo: fix this by resolving https://github.com/ipfs/js-ipfs-unixfs-exporter/issues/24
        const padding = Math.max(link.depth - pathParts.length, 0)

        print(
          rightpad(link.hash, multihashWidth + 1) +
          rightpad(link.size || '-', sizeWidth + 1) +
          '  '.repeat(padding) + fileName
        )
      })
    })())
  }
}
