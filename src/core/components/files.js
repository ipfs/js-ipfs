'use strict'

const unixfsEngine = require('ipfs-unixfs-engine')
const importer = unixfsEngine.importer
const exporter = unixfsEngine.exporter
const UnixFS = require('ipfs-unixfs')
const isStream = require('isstream')
const promisify = require('promisify-es6')
const multihashes = require('multihashes')
const pull = require('pull-stream')
const sort = require('pull-sort')
const toStream = require('pull-stream-to-stream')
const toPull = require('stream-to-pull-stream')

module.exports = function files (self) {
  const createAddPullStream = () => {
    return pull(
      pull.map(normalizeContent),
      pull.flatten(),
      importer(self._dagService),
      pull.asyncMap(prepareFile.bind(null, self))
    )
  }

  return {
    createAddStream: (callback) => {
      callback(null, toStream(createAddPullStream()))
    },

    createAddPullStream: createAddPullStream,

    add: promisify((data, callback) => {
      if (!callback || typeof callback !== 'function') {
        callback = function noop () {}
      }

      pull(
        pull.values(normalizeContent(data)),
        importer(self._dagService),
        pull.asyncMap(prepareFile.bind(null, self)),
        sort((a, b) => {
          if (a.path < b.path) return 1
          if (a.path > b.path) return -1
          return 0
        }),
        pull.collect(callback)
      )
    }),

    cat: promisify((hash, callback) => {
      if (typeof hash === 'function') {
        return callback(new Error('You must supply a multihash'))
      }

      self._dagService.get(hash, (err, node) => {
        if (err) {
          return callback(err)
        }

        const data = UnixFS.unmarshal(node.data)
        if (data.type === 'directory') {
          return callback(
            new Error('This dag node is a directory')
          )
        }

        pull(
          exporter(hash, self._dagService),
          pull.collect((err, files) => {
            if (err) return callback(err)
            callback(null, toStream.source(files[0].content))
          })
        )
      })
    }),

    get: promisify((hash, callback) => {
      callback(null, toStream.source(pull(
        exporter(hash, self._dagService),
        pull.map((file) => {
          if (file.content) {
            file.content = toStream.source(file.content)
            file.content.pause()
          }

          return file
        })
      )))
    }),

    getPull: promisify((hash, callback) => {
      callback(null, exporter(hash, self._dagService))
    })
  }
}

function prepareFile (self, file, cb) {
  const bs58mh = multihashes.toB58String(file.multihash)
  self.object.get(file.multihash, (err, node) => {
    if (err) return cb(err)

    cb(null, {
      path: file.path || bs58mh,
      hash: bs58mh,
      size: node.size()
    })
  })
}

function normalizeContent (content) {
  if (!Array.isArray(content)) {
    content = [content]
  }

  return content.map((data) => {
    // Buffer input
    if (Buffer.isBuffer(data)) {
      data = {
        path: '',
        content: pull.values([data])
      }
    }

    // Readable stream input
    if (isStream.isReadable(data)) {
      data = {
        path: '',
        content: toPull.source(data)
      }
    }

    if (data && data.content && typeof data.content !== 'function') {
      if (Buffer.isBuffer(data.content)) {
        data.content = pull.values([data.content])
      }

      if (isStream.isReadable(data.content)) {
        data.content = toPull.source(data.content)
      }
    }

    return data
  })
}
