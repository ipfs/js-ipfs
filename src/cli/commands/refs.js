'use strict'

const { print } = require('../utils')

module.exports = {
  command: 'refs <key>',

  describe: 'List links (references) from an object',

  builder: {
    r: {
      alias: 'recursive',
      desc: 'Recursively list links of child nodes.',
      type: 'boolean',
      default: false
    },
    format: {
      desc: 'Output edges with given format. Available tokens: <src> <dst> <linkname>.',
      type: 'string',
      default: '<dst>'
    },
    e: {
      alias: 'edges',
      desc: 'Output edge format: `<from> -> <to>`',
      type: 'boolean',
      default: false
    },
    u: {
      alias: 'unique',
      desc: 'Omit duplicate refs from output.',
      type: 'boolean',
      default: false
    },
    'max-depth': {
      desc: 'Only for recursive refs, limits fetch and listing to the given depth.',
      type: 'number'
    }
  },

  handler ({ getIpfs, key, recursive, format, e, u, maxDepth, resolve }) {
    resolve((async () => {
      if (maxDepth === 0) {
        return
      }

      const ipfs = await getIpfs()
      const refs = await ipfs.refs(key, { recursive, format, e, u, maxDepth })
      for (const ref of refs) {
        print(ref.Ref)
      }
    })())
  }
}
