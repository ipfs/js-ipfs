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

      printFiles(argv.ipfs, argv.recursive, multihashWidth, sizeWidth, 0, links)
    })
  }
}

function printFiles(ipfs, recurse, multihashWidth, sizeWidth, depth, links) {
  // console.log('links:', links)
  links.forEach(link => {
    printFile(multihashWidth, sizeWidth, depth, link)
    if (link.type === 'dir' && recurse) {
      ipfs.ls(link.hash, (err, files) => {
          if (err) throw err
          printFiles(ipfs, recurse, multihashWidth, sizeWidth, depth + 1, files)
      })
    }
  })
}

function printFile(multihashWidth, sizeWidth, depth, file) {
  const fileName = file.type === 'dir' ? `${file.name || ''}/` : file.name
  utils.print(
    utils.rightpad(file.hash, multihashWidth + 1) +
    utils.rightpad(file.size || '', sizeWidth + 1) +
    ' '.repeat(depth * 2) + fileName
  )
}
