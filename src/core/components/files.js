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
const CID = require('cids')
const waterfall = require('async/waterfall')

module.exports = function files (self) {
  const createAddPullStream = (options) => {
    return pull(
      pull.map(normalizeContent),
      pull.flatten(),
      importer(self._ipldResolver, options),
      pull.asyncMap(prepareFile.bind(null, self))
    )
  }

  return {
    createAddStream: (options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = undefined
      }
      callback(null, toStream(createAddPullStream(options)))
    },

    createAddPullStream: createAddPullStream,

    add: promisify((data, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = undefined
      } else if (!callback || typeof callback !== 'function') {
        callback = noop
      }

      pull(
        pull.values(normalizeContent(data)),
        importer(self._ipldResolver, options),
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

      self._ipldResolver.get(new CID(hash), (err, result) => {
        if (err) {
          return callback(err)
        }

        const node = result.value

        const data = UnixFS.unmarshal(node.data)

        if (data.type === 'directory') {
          return callback(new Error('This dag node is a directory'))
        }

        pull(
          exporter(hash, self._ipldResolver),
          pull.collect((err, files) => {
            if (err) {
              return callback(err)
            }
            callback(null, toStream.source(files[0].content))
          })
        )
      })
    }),

    get: promisify((hash, callback) => {
      callback(null, toStream.source(pull(
        exporter(hash, self._ipldResolver),
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
      callback(null, exporter(hash, self._ipldResolver))
    })
  }
}

function prepareFile (self, file, callback) {
  const bs58mh = multihashes.toB58String(file.multihash)

  waterfall([
    (cb) => self.object.get(file.multihash, cb),
    (node, cb) => {
      cb(null, {
        path: file.path || bs58mh,
        hash: bs58mh,
        size: node.size
      })
    }
  ], callback)
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

function noop () {}
