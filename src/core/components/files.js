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
const deferred = require('pull-defer')
const waterfall = require('async/waterfall')
const isStream = require('is-stream')
const Duplex = require('readable-stream').Duplex
const CID = require('cids')
const toB58String = require('multihashes').toB58String

function noop () {}

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
      data = { path: '', content: pull.values([data]) }
    }

    // Readable stream input
    if (isStream.readable(data)) {
      data = { path: '', content: toPull.source(data) }
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

class AddHelper extends Duplex {
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

module.exports = function files (self) {
  function _addPullStream (options) {
    const opts = Object.assign({}, {
      shardSplitThreshold: self._options.EXPERIMENTAL.sharding
        ? 1000
        : Infinity
    }, options)

    let total = 0
    let prog = opts.progress || (() => {})
    const progress = (bytes) => {
      total += bytes
      prog(total)
    }

    opts.progress = progress
    return pull(
      pull.map(normalizeContent),
      pull.flatten(),
      importer(self._ipldResolver, opts),
      pull.asyncMap(prepareFile.bind(null, self, opts))
    )
  }

  function _catPullStream (ipfsPath) {
    if (typeof ipfsPath === 'function') {
      throw new Error('You must supply an ipfsPath')
    }

    ipfsPath = normalizePath(ipfsPath)
    const pathComponents = ipfsPath.split('/')
    const restPath = normalizePath(pathComponents.slice(1).join('/'))
    const filterFile = (file) => (restPath && file.path === restPath) || (file.path === ipfsPath)

    const d = deferred.source()

    pull(
      exporter(ipfsPath, self._ipldResolver),
      pull.collect((err, files) => {
        if (err) { return d.abort(err) }
        if (files && files.length > 1) {
          files = files.filter(filterFile)
        }
        if (!files || !files.length) {
          return d.abort(new Error('No such file'))
        }

        const file = files[0]
        const content = file.content
        if (!content && file.type === 'dir') {
          return d.abort(new Error('this dag node is a directory'))
        }
        d.resolve(content)
      })
    )

    return d
  }

  function _lsPullStreamImmutable (ipfsPath) {
    const path = normalizePath(ipfsPath)
    const depth = path.split('/').length
    return pull(
      exporter(ipfsPath, self._ipldResolver, { maxDepth: depth }),
      pull.filter((node) => node.depth === depth),
      pull.map((node) => {
        node = Object.assign({}, node, { hash: toB58String(node.hash) })
        delete node.content
        return node
      })
    )
  }

  return {
    add: promisify((data, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      } else if (!callback || typeof callback !== 'function') {
        callback = noop
      }

      if (typeof data !== 'object' &&
          !Buffer.isBuffer(data) &&
          !isStream(data)) {
        return callback(new Error('Invalid arguments, data must be an object, Buffer or readable stream'))
      }

      pull(
        pull.values([data]),
        _addPullStream(options),
        sort((a, b) => {
          if (a.path < b.path) return 1
          if (a.path > b.path) return -1
          return 0
        }),
        pull.collect(callback)
      )
    }),

    addReadableStream: (options) => {
      options = options || {}

      const p = pushable()
      const s = pull(
        p,
        _addPullStream(options)
      )

      const retStream = new AddHelper(s, p)

      retStream.once('finish', () => p.end())

      return retStream
    },

    addPullStream: _addPullStream,

    cat: promisify((ipfsPath, callback) => {
      pull(
        _catPullStream(ipfsPath),
        pull.collect((err, buffers) => {
          if (err) { return callback(err) }
          callback(null, Buffer.concat(buffers))
        })
      )
    }),

    catReadableStream: (ipfsPath) => toStream.source(_catPullStream(ipfsPath)),

    catPullStream: _catPullStream,

    get: promisify((ipfsPath, callback) => {
      pull(
        exporter(ipfsPath, self._ipldResolver),
        pull.asyncMap((file, cb) => {
          if (file.content) {
            pull(
              file.content,
              pull.collect((err, buffers) => {
                if (err) { return cb(err) }
                file.content = Buffer.concat(buffers)
                cb(null, file)
              })
            )
          } else {
            cb(null, file)
          }
        }),
        pull.collect(callback)
      )
    }),

    getReadableStream: (ipfsPath) => {
      return toStream.source(
        pull(
          exporter(ipfsPath, self._ipldResolver),
          pull.map((file) => {
            if (file.content) {
              file.content = toStream.source(file.content)
              file.content.pause()
            }

            return file
          })
        )
      )
    },

    getPullStream: (ipfsPath) => {
      return exporter(ipfsPath, self._ipldResolver)
    },

    lsImmutable: promisify((ipfsPath, callback) => {
      pull(
        _lsPullStreamImmutable(ipfsPath),
        pull.collect((err, values) => {
          if (err) {
            return callback(err)
          }
          callback(null, values)
        })
      )
    }),

    lsReadableStreamImmutable: (ipfsPath) => {
      return toStream.source(_lsPullStreamImmutable(ipfsPath))
    },

    lsPullStreamImmutable: _lsPullStreamImmutable
  }
}

function normalizePath (path) {
  if (Buffer.isBuffer(path)) {
    path = toB58String(path)
  }
  if (path.indexOf('/ipfs/') === 0) {
    path = path.substring('/ipfs/'.length)
  }
  if (path.charAt(path.length - 1) === '/') {
    path = path.substring(0, path.length - 1)
  }

  return path
}
