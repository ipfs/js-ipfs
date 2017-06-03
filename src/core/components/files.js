'use strict'

const unixfsEngine = require('ipfs-unixfs-engine')
const importer = unixfsEngine.importer
const exporter = unixfsEngine.exporter
const UnixFS = require('ipfs-unixfs')
const promisify = require('promisify-es6')
const multihashes = require('multihashes')
const pull = require('pull-stream')
const sort = require('pull-sort')
const pushable = require('pull-pushable')
const toStream = require('pull-stream-to-stream')
const toPull = require('stream-to-pull-stream')
const CID = require('cids')
const bs58 = require('bs58')
const waterfall = require('async/waterfall')
const isStream = require('isstream')
const Duplex = require('stream').Duplex
const v = require('is-ipfs')

function cleanCID (cid) {
  if (Buffer.isBuffer(cid)) {
    cid = bs58.encode(cid)
  }
  if (typeof cid !== 'string') {
    throw new Error('unexpected cid type: ' + typeof cid)
  }
  CID.validateCID(new CID(cid.split('/')[0]))
  return cid
}

function cleanPath (ipfsPath) {
  try {
    ipfsPath = cleanCID(ipfsPath)
  } catch (err) {
    if (!v.ipfsPath(ipfsPath)) {
      throw err
    }
  }

  if (ipfsPath.indexOf('/ipfs/') === 0) {
    ipfsPath = ipfsPath.substring(6)
  }

  return ipfsPath
}

module.exports = function files (self) {
  const createAddPullStream = (options) => {
    const opts = Object.assign({}, {
      shardSplitThreshold: self._options.EXPERIMENTAL.sharding ? 1000 : Infinity
    }, options)

    return pull(
      pull.map(normalizeContent),
      pull.flatten(),
      importer(self._ipldResolver, opts),
      pull.asyncMap(prepareFile.bind(null, self))
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
        pull.asyncMap(prepareFile.bind(null, self)),
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

      try {
        ipfsPath = cleanPath(ipfsPath)
      } catch (err) {
        return callback(err)
      }

      self.dag.get(ipfsPath, (err, result) => {
        if (err) {
          return callback(err)
        }

        const node = result.value

        const data = UnixFS.unmarshal(node.data)

        if (data.type === 'directory') {
          return callback(new Error('This dag node is a directory'))
        }

        const cid = new CID(ipfsPath)

        pull(
          exporter(cid.multihash, self._ipldResolver),
          pull.collect((err, files) => {
            if (err) {
              return callback(err)
            }
            callback(null, toStream.source(files[0].content))
          })
        )
      })
    }),

    get: promisify((cid, callback) => {
      callback(null, toStream.source(pull(
        exporter(cid, self._ipldResolver),
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
