'use strict'

const unixfsEngine = require('ipfs-unixfs-engine')
const importer = unixfsEngine.importer
const exporter = unixfsEngine.exporter
const promisify = require('promisify-es6')
const pull = require('pull-stream')
const sort = require('pull-sort')
const pushable = require('pull-pushable')
const toStream = require('pull-stream-to-stream')
const toPull = require('stream-to-pull-stream')
const waterfall = require('async/waterfall')
const isStream = require('is-stream')
const Duplex = require('stream').Duplex
const CID = require('cids')

module.exports = function files (self) {
  const createAddPullStream = (options) => {
    const opts = Object.assign({}, {
      shardSplitThreshold: self._options.EXPERIMENTAL.sharding ? 1000 : Infinity
    }, options)

    return pull(
      pull.map(normalizeContent),
      pull.flatten(),
      importer(self._ipldResolver, opts),
      pull.asyncMap(prepareFile.bind(null, self, opts))
    )
  }

  return {
    createAddStream: (options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = undefined
      }

      const addPullStream = createAddPullStream(options)
      const p = pushable()
      const s = pull(
        p,
        addPullStream
      )

      const retStream = new AddStreamDuplex(s, p)

      retStream.once('finish', () => p.end())

      callback(null, retStream)
    },

    createAddPullStream: createAddPullStream,

    add: promisify((data, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = undefined
      } else if (!callback || typeof callback !== 'function') {
        callback = noop
      }

      if (typeof data !== 'object' &&
          !Buffer.isBuffer(data) &&
          !isStream(data)) {
        return callback(new Error('Invalid arguments, data must be an object, Buffer or readable stream'))
      }

      pull(
        pull.values(normalizeContent(data)),
        importer(self._ipldResolver, options),
        pull.asyncMap(prepareFile.bind(null, self, options)),
        sort((a, b) => {
          if (a.path < b.path) return 1
          if (a.path > b.path) return -1
          return 0
        }),
        pull.collect(callback)
      )
    }),

    cat: promisify((ipfsPath, callback) => {
      if (typeof ipfsPath === 'function') {
        return callback(new Error('You must supply a ipfsPath'))
      }

      pull(
        exporter(ipfsPath, self._ipldResolver),
        pull.collect((err, files) => {
          if (err) {
            return callback(err)
          }
          callback(null, toStream.source(files[files.length - 1].content))
        })
      )
    }),

    get: promisify((ipfsPath, callback) => {
      callback(null, toStream.source(pull(
        exporter(ipfsPath, self._ipldResolver),
        pull.map((file) => {
          if (file.content) {
            file.content = toStream.source(file.content)
            file.content.pause()
          }

          return file
        })
      )))
    }),

    getPull: promisify((ipfsPath, callback) => {
      callback(null, exporter(ipfsPath, self._ipldResolver))
    })
  }
}

function prepareFile (self, opts, file, callback) {
  opts = opts || {}

  waterfall([
    (cb) => self.object.get(file.multihash, cb),
    (node, cb) => {
      let cid = new CID(node.multihash)

      if (opts['cid-version'] === 1) {
        cid = cid.toV1()
      }

      const b58Hash = cid.toBaseEncodedString()

      cb(null, {
        path: file.path || b58Hash,
        hash: b58Hash,
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
    if (isStream.readable(data)) {
      data = {
        path: '',
        content: toPull.source(data)
      }
    }

    if (data && data.content && typeof data.content !== 'function') {
      if (Buffer.isBuffer(data.content)) {
        data.content = pull.values([data.content])
      }

      if (isStream.readable(data.content)) {
        data.content = toPull.source(data.content)
      }
    }

    return data
  })
}

function noop () {}

class AddStreamDuplex extends Duplex {
  constructor (pullStream, push, options) {
    super(Object.assign({ objectMode: true }, options))
    this._pullStream = pullStream
    this._pushable = push
    this._waitingPullFlush = []
  }

  _read () {
    this._pullStream(null, (end, data) => {
      while (this._waitingPullFlush.length) {
        const cb = this._waitingPullFlush.shift()
        cb()
      }
      if (end) {
        if (end instanceof Error) {
          this.emit('error', end)
        }
      } else {
        this.push(data)
      }
    })
  }

  _write (chunk, encoding, callback) {
    this._waitingPullFlush.push(callback)
    this._pushable.push(chunk)
  }
}
