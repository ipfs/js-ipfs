'use strict'

const utils = require('../utils')

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
    }
  },

  handler (argv) {
    let path = argv.key
    if (path.startsWith('/ipfs/')) {
      path = path.replace('/ipfs/', '')
    }

    argv.ipfs.ls(path, { recursive: argv.recursive }, (err, links) => {
      if (err) {
        throw err
      }

      if (argv.headers) {
        links = [{hash: 'Hash', size: 'Size', name: 'Name'}].concat(links)
      }

      const multihashWidth = Math.max.apply(null, links.map((file) => file.hash.length))
      const sizeWidth = Math.max.apply(null, links.map((file) => String(file.size).length))

      links.forEach(link => {
        const fileName = link.type === 'dir' ? `${link.name || ''}/` : link.name
        const padding = link.depth - path.split('/').length
        utils.print(
          utils.rightpad(link.hash, multihashWidth + 1) +
          utils.rightpad(link.size || '', sizeWidth + 1) +
          '  '.repeat(padding) + fileName
        )
      })
    })
  }
}
