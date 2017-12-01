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

    argv.ipfs.ls(path, (err, links) => {
      if (err) {
        throw err
      }

      if (argv.headers) {
        links = [{hash: 'Hash', size: 'Size', name: 'Name'}].concat(links)
      }

      links = links.filter((link) => link.path !== path)
      links.forEach((link) => {
        if (link.type === 'dir') {
          // directory: add trailing "/"
          link.name = (link.name || '') + '/'
        }
      })
      const multihashWidth = Math.max.apply(null, links.map((file) => file.hash.length))
      const sizeWidth = Math.max.apply(null, links.map((file) => String(file.size).length))

      links.forEach((file) => {
        utils.print(utils.rightpad(file.hash, multihashWidth + 1) +
          utils.rightpad(file.size || '', sizeWidth + 1) +
            file.name)
      })
    })
  }
}
