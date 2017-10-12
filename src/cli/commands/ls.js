'use strict'

const utils = require('../utils')
const Unixfs = require('ipfs-unixfs')

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

    argv.ipfs.object.get(path, {enc: 'base58'}, (err, node) => {
      if (err) {
        throw err
      }
      let {data, links} = node.toJSON()

      const fileDesc = Unixfs.unmarshal(data)
      if (fileDesc.type !== 'directory') {
        throw new Error('merkeldag node was not a directory') // TODO: support shards
      }

      if (argv['resolve-type']) {
        throw new Error('--resolve-type not implemented yet')
      }

      if (argv.headers) {
        links = [{multihash: 'Hash', size: 'Size', name: 'Name'}].concat(links)
      }

      const multihashWidth = Math.max.apply(null, links.map((file) => String(file.multihash).length))
      const sizeWidth = Math.max.apply(null, links.map((file) => String(file.size).length))

      links.forEach((file) => {
        utils.print(utils.rightpad(file.multihash, multihashWidth + 1) +
          utils.rightpad(file.size, sizeWidth + 1) +
            file.name)
      })
    })
  }
}
