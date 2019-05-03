'use strict'

const { print } = require('../utils')

module.exports = {
  command: 'refs <key>',

  describe: 'List links (references) from an object',

  builder: {
    recursive: {
      alias: 'r',
      desc: 'Recursively list links of child nodes.',
      type: 'boolean',
      default: false
    },
    format: {
      desc: 'Output edges with given format. Available tokens: <src> <dst> <linkname>.',
      type: 'string',
      default: '<dst>'
    },
    edges: {
      alias: 'e',
      desc: 'Output edge format: `<from> -> <to>`',
      type: 'boolean',
      default: false
    },
    unique: {
      alias: 'u',
      desc: 'Omit duplicate refs from output.',
      type: 'boolean',
      default: false
    },
    'max-depth': {
      desc: 'Only for recursive refs, limits fetch and listing to the given depth.',
      type: 'number'
    }
  },

  handler ({ _, getIpfs, key, recursive, format, edges, unique, maxDepth, resolve }) {
    // First key is in `key`
    // Any subsequent keys are in `_` array after 'refs'
    const keys = [key].concat(_.slice(1))

    resolve((async () => {
      if (maxDepth === 0) {
        return
      }

      const ipfs = await getIpfs()
      const refs = await ipfs.refs(keys, { recursive, format, edges, unique, maxDepth })
      for (const ref of refs) {
        print(ref.ref)
      }
    })())
  }
}
