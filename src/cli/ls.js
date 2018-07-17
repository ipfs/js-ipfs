'use strict'

const {
  print,
  asBoolean
} = require('./utils')
const {
  FILE_SEPARATOR
} = require('../core/utils')

module.exports = {
  command: 'ls [path]',

  describe: 'List mfs directories',

  builder: {
    long: {
      alias: 'l',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Use long listing format.'
    },
    cidBase: {
      alias: 'cid-base',
      default: 'base58btc',
      describe: 'CID base to use.'
    }
  },

  handler (argv) {
    let {
      path,
      ipfs,
      long,
      cidBase
    } = argv

    argv.resolve(
      ipfs.files.ls(path || FILE_SEPARATOR, {
        long,
        cidBase
      })
        .then(files => {
          if (long) {
            const table = []
            const lengths = {}

            files.forEach(link => {
              const row = {
                name: `${link.name}`,
                hash: `${link.hash}`,
                size: `${link.size}`
              }

              Object.keys(row).forEach(key => {
                const value = row[key]

                lengths[key] = lengths[key] > value.length ? lengths[key] : value.length
              })

              table.push(row)
            })

            table.forEach(row => {
              let line = ''

              Object.keys(row).forEach(key => {
                const value = row[key]

                line += value.padEnd(lengths[key])
                line += '\t'
              })

              print(line)
            })

            return
          }

          files.forEach(link => print(link.name))
        })
    )
  }
}
