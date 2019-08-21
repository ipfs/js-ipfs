'use strict'

const mfs = require('ipfs-mfs/core')
const isPullStream = require('is-pull-stream')
const toPullStream = require('async-iterator-to-pull-stream')
const toReadableStream = require('async-iterator-to-stream')
const pullStreamToAsyncIterator = require('pull-stream-to-async-iterator')
const all = require('async-iterator-all')
const nodeify = require('promise-nodeify')
const PassThrough = require('stream').PassThrough
const pull = require('pull-stream/pull')
const map = require('pull-stream/throughs/map')
const isIpfs = require('is-ipfs')
const { cidToString } = require('../../utils/cid')

const mapLsFile = (options = {}) => {
  const long = options.long || options.l

  return (file) => {
    return {
      hash: long ? cidToString(file.cid, { base: options.cidBase }) : '',
      name: file.name,
      type: long ? file.type : 0,
      size: long ? file.size || 0 : 0
    }
  }
}

const withPreload = fn => (...args) => {
  const paths = args.filter(arg => isIpfs.ipfsPath(arg) || isIpfs.cid(arg))

  if (paths.length) {
    const options = args[args.length - 1]
    if (options.preload !== false) {
      paths.forEach(path => self._preload(path))
    }
  }

  return fn(...args)
}
module.exports = (/** @type { import("../index") } */ ipfs) => {
  const methodsOriginal = mfs({
    ipld: ipfs._ipld,
    blocks: ipfs._blockService,
    datastore: ipfs._repo.root,
    repoOwner: ipfs._options.repoOwner
  })

  const methods = {
    ...methodsOriginal,
    cp: withPreload(methodsOriginal.cp),
    ls: withPreload(methodsOriginal.ls),
    mv: withPreload(methodsOriginal.mv),
    read: withPreload(methodsOriginal.read),
    stat: withPreload(methodsOriginal.stat)
  }

  return {
    /**
     * Copy files
     *
     * @param {String | Array<String>} from - The path(s) of the source to copy.
     * @param {String} to - The path of the destination to copy to.
     * @param {Object} [opts] - Options for copy.
     * @param {boolean} [opts.parents=false] - Whether or not to make the parent directories if they don't exist. (default: false)
     * @param {String} [opts.format=dag-pb] - Format of nodes to write any newly created directories as. (default: dag-pb)
     * @param {String} [opts.hashAlg=sha2-256] - Algorithm to use when creating CIDs for newly created directories. (default: sha2-256) {@link https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343 The list of all possible values}
     * @param {boolean} [opts.flush=true] - Whether or not to immediately flush MFS changes to disk (default: true).
     * @param {function(Error): void} [cb] - Callback function.
     * @returns {Promise<string> | void} - When callback is provided nothing is returned.
     */
    cp: (from, to, opts, cb) => {
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      return nodeify(methods.cp(from, to, opts), cb)
    },

    mkdir: (path, opts, cb) => {
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      return nodeify(methods.mkdir(path, opts), cb)
    },

    stat: (path, opts, cb) => {
      const stat = async (path, opts = {}) => {
        const stats = await methods.stat(path, opts)

        stats.hash = stats.cid.toBaseEncodedString(opts && opts.cidBase)
        delete stats.cid

        return stats
      }

      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }

      return nodeify(stat(path, opts), cb)
    },

    rm: (paths, opts, cb) => {
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      return nodeify(methods.rm(paths, opts), cb)
    },

    read: (path, opts, cb) => {
      const read = async (path, opts = {}) => {
        return Buffer.concat(await all(methods.read(path, opts)))
      }

      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      return nodeify(read(path, opts), cb)
    },

    readPullStream: (path, opts = {}) => toPullStream.source(methods.read(path, opts)),

    readReadableStream: (path, opts = {}) => toReadableStream(methods.read(path, opts)),

    write: (path, content, opts, cb) => {
      const write = async (path, content, opts = {}) => {
        if (isPullStream.isSource(content)) {
          content = pullStreamToAsyncIterator(content)
        }

        await methods.write(path, content, opts)
      }
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      return nodeify(write(path, content, opts), cb)
    },

    mv: (from, to, opts, cb) => {
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      return nodeify(methods.mv(from, to, opts), cb)
    },

    flush: (paths, cb) => nodeify(methods.flush(paths), cb),

    ls: (path, opts, cb) => {
      const ls = async (path, opts = {}) => {
        const files = await all(methods.ls(path, opts))

        return files.map(mapLsFile(opts))
      }

      if (typeof path === 'function') {
        cb = path
        path = '/'
        opts = {}
      }

      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      return nodeify(ls(path, opts), cb)
    },

    lsReadableStream: (path, options = {}) => {
      const stream = toReadableStream.obj(methods.ls(path, options))
      const through = new PassThrough({
        objectMode: true
      })
      stream.on('data', (file) => {
        through.write(mapLsFile(options)(file))
      })
      stream.on('error', (err) => {
        through.destroy(err)
      })
      stream.on('end', (file, enc, cb) => {
        if (file) {
          file = mapLsFile(options)(file)
        }

        through.end(file, enc, cb)
      })

      return through
    },

    lsPullStream: (path, options = {}) => {
      return pull(
        toPullStream.source(methods.ls(path, options)),
        map(mapLsFile(options))
      )
    }
  }
}
