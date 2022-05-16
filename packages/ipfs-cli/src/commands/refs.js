import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {string} Argv.key
 * @property {string} Argv.keys
 * @property {boolean} Argv.recursive
 * @property {string} Argv.format
 * @property {boolean} Argv.edges
 * @property {boolean} Argv.unique
 * @property {number} Argv.maxDepth
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'refs <key> [keys..]',

  describe: 'List links (references) from an object',

  builder: {
    recursive: {
      alias: 'r',
      desc: 'Recursively list links of child nodes',
      boolean: true,
      default: false
    },
    format: {
      desc: 'Output edges with given format. Available tokens: <src> <dst> <linkname>',
      string: true,
      default: '<dst>'
    },
    edges: {
      alias: 'e',
      desc: 'Output edge format: `<from> -> <to>`',
      boolean: true,
      default: false
    },
    unique: {
      alias: 'u',
      desc: 'Omit duplicate refs from output',
      boolean: true,
      default: false
    },
    'max-depth': {
      desc: 'Only for recursive refs, limits fetch and listing to the given depth',
      number: true
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, key, keys, recursive, format, edges, unique, maxDepth, timeout }) {
    if (maxDepth === 0) {
      return
    }

    const k = [key].concat(keys)

    for await (const { err, ref } of ipfs.refs(k, { recursive, format, edges, unique, maxDepth, timeout })) {
      if (err) {
        print(err.toString(), true, true)
      } else {
        print(ref)
      }
    }
  }
}

export default command
