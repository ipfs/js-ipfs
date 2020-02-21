'use strict'

const {
  asBoolean
} = require('./utils')
const formatMode = require('ipfs-utils/src/files/format-mode')
const formatMtime = require('ipfs-utils/src/files/format-mtime')

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
Type: <type>
Mode: <mode>
Mtime: <mtime>`,
      describe: 'Print statistics in given format. Allowed tokens: <hash> <size> <cumulsize> <type> <childs> <mode> <mtime>. Conflicts with other format options.'
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
      describe: 'CID base to use.'
    }
  },

  handler (argv) {
    const {
      path,
      getIpfs,
      print,
      format,
      hash,
      size,
      withLocal,
      cidBase
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()

      return ipfs.files.stat(path, {
        withLocal
      })
        .then((stats) => {
          if (hash) {
            return print(stats.cid.toString(cidBase))
          }

          if (size) {
            return print(stats.size)
          }

          print(format
            .replace('<hash>', stats.cid.toString(cidBase))
            .replace('<size>', stats.size)
            .replace('<cumulsize>', stats.cumulativeSize)
            .replace('<childs>', stats.blocks)
            .replace('<type>', stats.type)
            .replace('<mode>', formatMode(stats.mode, stats.type === 'directory'))
            .replace('<mtime>', formatMtime(stats.mtime))
          )
        })
    })())
  }
}
