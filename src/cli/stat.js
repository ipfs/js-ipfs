'use strict'

const {
  asBoolean,
  print
} = require('./utils')

module.exports = {
  command: 'stat [path]',

  describe: 'Display file/directory status',

  builder: {
    format: {
      alias: 'f',
      type: 'string',
      default: `<hash>
Size: <size>
CumulativeSize: <cumulsize>
ChildBlocks: <childs>
Type: <type>`,
      describe: 'Print statistics in given format. Allowed tokens: <hash> <size> <cumulsize> <type> <childs>. Conflicts with other format options.'
    },
    hash: {
      alias: 'h',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Print only hash. Implies \'--format=<hash>\'. Conflicts with other format options.'
    },
    size: {
      alias: 's',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Print only size. Implies \'--format=<cumulsize>\'. Conflicts with other format options.'
    },
    'with-local': {
      alias: 'l',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Compute the amount of the dag that is local, and if possible the total size'
    },
    'cid-base': {
      default: 'base58btc',
      describe: 'CID base to use.'
    }
  },

  handler (argv) {
    const {
      path,
      getIpfs,
      format,
      hash,
      size,
      withLocal
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()

      return ipfs.files.stat(path, {
        withLocal
      })
        .then((stats) => {
          if (hash) {
            return print(stats.hash)
          }

          if (size) {
            return print(stats.size)
          }

          print(format
            .replace('<hash>', stats.hash)
            .replace('<size>', stats.size)
            .replace('<cumulsize>', stats.cumulativeSize)
            .replace('<childs>', stats.blocks)
            .replace('<type>', stats.type)
          )
        })
    })())
  }
}
