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
const isSource = require('is-pull-stream').isSource
const Duplex = require('readable-stream').Duplex
const isString = require('lodash/isString')
const CID = require('cids')
const toB58String = require('multihashes').toB58String
const errCode = require('err-code')
const parseChunkerString = require('../utils').parseChunkerString

const WRAPPER = 'wrapper/'

function noop () {}

function normalizePath (path) {
  if (Buffer.isBuffer(path)) {
    path = toB58String(path)
  }
  if (CID.isCID(path)) {
    path = path.toBaseEncodedString()
  }
  if (path.indexOf('/ipfs/') === 0) {
    path = path.substring('/ipfs/'.length)
  }
  if (path.charAt(path.length - 1) === '/') {
    path = path.substring(0, path.length - 1)
  }

  return path
}

function prepareFile (self, opts, file, callback) {
  opts = opts || {}

  let cid = new CID(file.multihash)

  if (opts.cidVersion === 1) {
    cid = cid.toV1()
  }

  waterfall([
    (cb) => opts.onlyHash
      ? cb(null, file)
      : self.object.get(file.multihash, Object.assign({}, opts, { preload: false }), cb),
    (node, cb) => {
      const b58Hash = cid.toBaseEncodedString()

      let size = node.size

      if (Buffer.isBuffer(node)) {
        size = node.length
      }

      cb(null, {
        path: opts.wrapWithDirectory
          ? file.path.substring(WRAPPER.length)
          : (file.path || b58Hash),
        hash: b58Hash,
        size
      })
    }
  ], callback)
}

function normalizeContent (opts, content) {
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

    if (isSource(data)) {
      data = { path: '', content: data }
    }

    if (data && data.content && typeof data.content !== 'function') {
      if (Buffer.isBuffer(data.content)) {
        data.content = pull.values([data.content])
      }

      if (isStream.readable(data.content)) {
        data.content = toPull.source(data.content)
      }
    }

    if (opts.wrapWithDirectory && !data.path) {
      throw new Error('Must provide a path when wrapping with a directory')
    }

    if (opts.wrapWithDirectory) {
      data.path = WRAPPER + data.path
    }

    return data
  })
}

function preloadFile (self, opts, file) {
  const isRootFile = opts.wrapWithDirectory
    ? file.path === ''
    : !file.path.includes('/')

  const shouldPreload = isRootFile && !opts.onlyHash && opts.preload !== false

  if (shouldPreload) {
    self._preload(file.hash)
  }

  return file
}

function pinFile (self, opts, file, cb) {
  // Pin a file if it is the root dir of a recursive add or the single file
  // of a direct add.
  const pin = 'pin' in opts ? opts.pin : true
  const isRootDir = !file.path.includes('/')
  const shouldPin = pin && isRootDir && !opts.onlyHash && !opts.hashAlg
  if (shouldPin) {
    return self.pin.add(file.hash, { preload: false }, err => cb(err, file))
  } else {
    cb(null, file)
  }
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

module.exports = function (self) {
  // Internal add func that gets used by all add funcs
  function _addPullStream (options = {}) {
    let chunkerOptions
    try {
      chunkerOptions = parseChunkerString(options.chunker)
    } catch (err) {
      return pull.map(() => { throw err })
    }
    const opts = Object.assign({}, {
      shardSplitThreshold: self._options.EXPERIMENTAL.sharding
        ? 1000
        : Infinity
    }, options, chunkerOptions)

    if (opts.hashAlg && opts.cidVersion !== 1) {
      opts.cidVersion = 1
    }

    let total = 0

    const prog = opts.progress || noop
    const progress = (bytes) => {
      total += bytes
      prog(total)
    }

    opts.progress = progress
    return pull(
      pull.map(normalizeContent.bind(null, opts)),
      pull.flatten(),
      importer(self._ipld, opts),
      pull.asyncMap(prepareFile.bind(null, self, opts)),
      pull.map(preloadFile.bind(null, self, opts)),
      pull.asyncMap(pinFile.bind(null, self, opts))
    )
  }

  // Internal cat func that gets used by all cat funcs
  function _catPullStream (ipfsPath, options) {
    if (typeof ipfsPath === 'function') {
      throw new Error('You must supply an ipfsPath')
    }

    options = options || {}

    ipfsPath = normalizePath(ipfsPath)
    const pathComponents = ipfsPath.split('/')
    const restPath = normalizePath(pathComponents.slice(1).join('/'))
    const filterFile = (file) => (restPath && file.path === restPath) || (file.path === ipfsPath)

    if (options.preload !== false) {
      self._preload(pathComponents[0])
    }

    const d = deferred.source()

    pull(
      exporter(ipfsPath, self._ipld, options),
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

  // Internal ls func that gets used by all ls funcs
  function _lsPullStream (ipfsPath, options) {
    options = options || {}

    const path = normalizePath(ipfsPath)
    const recursive = options.recursive
    const pathComponents = path.split('/')
    const pathDepth = pathComponents.length
    const maxDepth = recursive ? global.Infinity : pathDepth
    options.maxDepth = options.maxDepth || maxDepth

    if (options.preload !== false) {
      self._preload(pathComponents[0])
    }

    return pull(
      exporter(ipfsPath, self._ipld, options),
      pull.filter(node =>
        recursive ? node.depth >= pathDepth : node.depth === pathDepth
      ),
      pull.map(node => {
        const cid = new CID(node.hash)
        node = Object.assign({}, node, { hash: cid.toBaseEncodedString() })
        delete node.content
        return node
      })
    )
  }

  return {
    add: (() => {
      const add = promisify((data, options, callback) => {
        if (typeof options === 'function') {
          callback = options
          options = {}
        }

        options = options || {}

        // Buffer, pull stream or Node.js stream
        const isBufferOrStream = obj => Buffer.isBuffer(obj) || isStream.readable(obj) || isSource(obj)
        // An object like { content?, path? }, where content isBufferOrStream and path isString
        const isContentObject = obj => {
          if (typeof obj !== 'object') return false
          // path is optional if content is present
          if (obj.content) return isBufferOrStream(obj.content)
          // path must be a non-empty string if no content
          return Boolean(obj.path) && isString(obj.path)
        }
        // An input atom: a buffer, stream or content object
        const isInput = obj => isBufferOrStream(obj) || isContentObject(obj)
        // All is ok if data isInput or data is an array of isInput
        const ok = isInput(data) || (Array.isArray(data) && data.every(isInput))

        if (!ok) {
          return callback(new Error('invalid input: expected buffer, readable stream, pull stream, object or array of objects'))
        }

        // CID v0 is for multihashes encoded with sha2-256
        if (options.hashAlg && options.cidVersion !== 1) {
          options.cidVersion = 1
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
      })

      return function () {
        const args = Array.from(arguments)

        // If we .add(<pull stream>), then promisify thinks the pull stream
        // is a callback! Add an empty options object in this case so that a
        // promise is returned.
        if (args.length === 1 && isSource(args[0])) {
          args.push({})
        }

        return add.apply(null, args)
      }
    })(),

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

    cat: promisify((ipfsPath, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      if (typeof callback !== 'function') {
        throw new Error('Please supply a callback to ipfs.cat')
      }

      pull(
        _catPullStream(ipfsPath, options),
        pull.collect((err, buffers) => {
          if (err) { return callback(err) }
          callback(null, Buffer.concat(buffers))
        })
      )
    }),

    catReadableStream: (ipfsPath, options) => toStream.source(_catPullStream(ipfsPath, options)),

    catPullStream: (ipfsPath, options) => _catPullStream(ipfsPath, options),

    get: promisify((ipfsPath, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      if (options.preload !== false) {
        let pathComponents

        try {
          pathComponents = normalizePath(ipfsPath).split('/')
        } catch (err) {
          return setImmediate(() => callback(errCode(err, 'ERR_INVALID_PATH')))
        }

        self._preload(pathComponents[0])
      }

      pull(
        exporter(ipfsPath, self._ipld, options),
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

    getReadableStream: (ipfsPath, options) => {
      options = options || {}

      if (options.preload !== false) {
        let pathComponents

        try {
          pathComponents = normalizePath(ipfsPath).split('/')
        } catch (err) {
          return toStream.source(pull.error(errCode(err, 'ERR_INVALID_PATH')))
        }

        self._preload(pathComponents[0])
      }

      return toStream.source(
        pull(
          exporter(ipfsPath, self._ipld, options),
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

    getPullStream: (ipfsPath, options) => {
      options = options || {}

      if (options.preload !== false) {
        let pathComponents

        try {
          pathComponents = normalizePath(ipfsPath).split('/')
        } catch (err) {
          return pull.error(errCode(err, 'ERR_INVALID_PATH'))
        }

        self._preload(pathComponents[0])
      }

      return exporter(ipfsPath, self._ipld, options)
    },

    ls: promisify((ipfsPath, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      pull(
        _lsPullStream(ipfsPath, options),
        pull.collect((err, values) => {
          if (err) {
            callback(err)
            return
          }
          callback(null, values)
        })
      )
    }),

    lsReadableStream: (ipfsPath, options) => {
      return toStream.source(_lsPullStream(ipfsPath, options))
    },

    lsPullStream: _lsPullStream

    // TODO create addFromFs
    // TODO create addFromStream
    // TODO create addFromUrl
  }
}
