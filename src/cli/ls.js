'use strict'

const pull = require('pull-stream/pull')
const onEnd = require('pull-stream/sinks/on-end')
const through = require('pull-stream/throughs/through')
const {
  asBoolean
} = require('./utils')
const {
  FILE_SEPARATOR
} = require('../core/utils/constants')
const formatMode = require('ipfs-utils/src/files/format-mode')
const formatMtime = require('ipfs-utils/src/files/format-mtime')

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
    sort: {
      alias: 's',
      type: 'boolean',
      default: true,
      coerce: asBoolean,
      describe: 'Sort entries by name'
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
      long,
      sort,
      cidBase,
      print
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()
      return new Promise((resolve, reject) => {
        if (sort) {
          ipfs.files.ls(path || FILE_SEPARATOR)
            .then(files => {
              // https://github.com/ipfs/go-ipfs/issues/5181
              if (sort) {
                files = files.sort((a, b) => {
                  return a.name.localeCompare(b.name)
                })
              }

              if (long) {
                files.forEach(file => {
                  print(`${formatMode(file.mode, file.type === 1)}\t${formatMtime(file.mtime)}\t${file.name}\t${file.hash}\t${file.size}`)
                })
              } else {
                files.forEach(link => print(link.name))
              }

              resolve()
            })
            .catch(reject)

          return
        }

        pull(
          ipfs.files.lsPullStream(path, {
            long,
            cidBase
          }),
          through(file => {
            if (long) {
              print(`${formatMode(file.mode, file.type === 1)}\t${formatMtime(file.mtime)}\t${file.name}\t${file.hash}\t${file.size}`)
            } else {
              print(file.name)
            }
          }),
          onEnd((error) => {
            if (error) {
              return reject(error)
            }

            resolve()
          })
        )
      })
    })())
  }
}
