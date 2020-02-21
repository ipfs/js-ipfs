'use strict'

module.exports = {
  command: 'refs <key> [keys..]',

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

  handler ({ getIpfs, print, key, keys, recursive, format, edges, unique, maxDepth, resolve }) {
    resolve((async () => {
      if (maxDepth === 0) {
        return
      }

      const ipfs = await getIpfs()
      const k = [key].concat(keys)

      for await (const ref of ipfs.refs(k, { recursive, format, edges, unique, maxDepth })) {
        if (ref.err) {
          print(ref.err, true, true)
        } else {
          print(ref.ref)
        }
      }
    })())
  }
}
