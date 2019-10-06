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

/**
 * @typedef { import("readable-stream").Readable } ReadableStream
 * @typedef { import("pull-stream") } PullStream
 */

const mapLsFile = (options) => {
  options = options || {}

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

module.exports = (/** @type { import("../index") } */ ipfs) => {
  const methodsOriginal = mfs({
    ipld: ipfs._ipld,
    blocks: ipfs._blockService,
    datastore: ipfs._repo.root,
    repoOwner: ipfs._options.repoOwner
  })

  const withPreload = fn => (...args) => {
    const paths = args.filter(arg => isIpfs.ipfsPath(arg) || isIpfs.cid(arg))

    if (paths.length) {
      const options = args[args.length - 1]
      if (options && options.preload !== false) {
        paths.forEach(path => ipfs._preload(path))
      }
    }

    return fn(...args)
  }

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
     * @returns {Promise<string> | void} When callback is provided nothing is returned.
     */
    cp: (from, to, opts, cb) => {
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      return nodeify(methods.cp(from, to, opts), cb)
    },

    /**
     * Make a directory
     *
     * @param {String} path - The path to the directory to make.
     * @param {Object} [opts] - Options for mkdir.
     * @param {boolean} [opts.parents=false] - Value to decide whether or not to make the parent directories if they don't exist. (default: false)
     * @param {String} [opts.format=dag-pb] - Format of nodes to write any newly created directories as. (default: dag-pb).
     * @param {String} [opts.hashAlg] - Algorithm to use when creating CIDs for newly created directories. (default: sha2-256) {@link https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343 The list of all possible values}
     * @param {boolean} [opts.flush=true] - Whether or not to immediately flush MFS changes to disk (default: true).
     * @param {function(Error): void} [cb] - Callback function.
     * @returns {Promise<undefined> | void} When callback is provided nothing is returned.
     */
    mkdir: (path, opts, cb) => {
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      return nodeify(methods.mkdir(path, opts), cb)
    },

    /**
     * @typedef {Object} StatOutput
     * @prop {String} hash - Output hash.
     * @prop {number} size - File size in bytes.
     * @prop {number} cumulativeSize - Integer with the size of the DAGNodes making up the file in Bytes.
     * @prop {string} type - Output type either 'directory' or 'file'.
     * @prop {number} blocks - If type is directory, this is the number of files in the directory. If it is file it is the number of blocks that make up the file.
     * @prop {boolean} withLocality - Indicate if locality information is present.
     * @prop {boolean} local - Indicate if the queried dag is fully present locally.
     * @prop {number} sizeLocal - Integer indicating the cumulative size of the data present locally.
     */

    /**
     * Get file or directory status.
     *
     * @param {String} path - Path to the file or directory to stat.
     * @param {Object} [opts] - Options for stat.
     * @param {boolean} [opts.hash=false] - Return only the hash. (default: false)
     * @param {boolean} [opts.size=false] - Return only the size. (default: false)
     * @param {boolean} [opts.withLocal=false] - Compute the amount of the dag that is local, and if possible the total size. (default: false)
     * @param {String} [opts.cidBase=base58btc] - Which number base to use to format hashes - e.g. base32, base64 etc. (default: base58btc)
     * @param {function(Error, StatOutput): void} [cb] - Callback function.
     * @returns {Promise<StatOutput> | void} When callback is provided nothing is returned.
     */
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

    /**
     * Remove a file or directory.
     *
     * @param {String | Array<String>} paths - One or more paths to remove.
     * @param {Object} [opts] - Options for remove.
     * @param {boolean} [opts.recursive=false] - Whether or not to remove directories recursively. (default: false)
     * @param {function(Error): void} [cb] - Callback function.
     * @returns {Promise<undefined> | void} When callback is provided nothing is returned.
     */
    rm: (paths, opts, cb) => {
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      return nodeify(methods.rm(paths, opts), cb)
    },

    /**
     * @typedef {Object} ReadOptions
     * @prop {number} [opts.offset=0] - Integer with the byte offset to begin reading from (default: 0).
     * @prop {number} [opts.length] - Integer with the maximum number of bytes to read (default: Read to the end of stream).
     */

    /**
     * Read a file into a Buffer.
     *
     * @param {string} path - Path of the file to read and must point to a file (and not a directory).
     * @param {ReadOptions} [opts] - Object for read.
     * @param {function(Error, Buffer): void} [cb] - Callback function.
     * @returns {Promise<Buffer> | void} When callback is provided nothing is returned.
     */
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

    /**
     * Read a file into a ReadableStream.
     *
     * @param {string} path - Path of the file to read and must point to a file (and not a directory).
     * @param {ReadOptions} [opts] - Object for read.
     * @returns {ReadableStream} Returns a ReadableStream with the contents of path.
     */
    readReadableStream: (path, opts = {}) => toReadableStream(methods.read(path, opts)),

    /**
     * Read a file into a PullStrean.
     *
     * @param {string} path - Path of the file to read and must point to a file (and not a directory).
     * @param {ReadOptions} [opts] - Object for read.
     * @returns {PullStream} Returns a PullStream with the contents of path.
     */
    readPullStream: (path, opts = {}) => toPullStream.source(methods.read(path, opts)),

    /**
     * Write to a file.
     *
     * @param {string} path - Path of the file to write.
     * @param {Buffer | PullStream | ReadableStream | Blob | string} content - Content to write.
     * @param {Object} opts - Options for write.
     * @param {number} [opts.offset=0] - Integer with the byte offset to begin writing at. (default: 0)
     * @param {boolean} [opts.create=false] - Indicate to create the file if it doesn't exist. (default: false)
     * @param {boolean} [opts.truncate=false] - Indicate if the file should be truncated after writing all the bytes from content. (default: false)
     * @param {boolena} [opts.parents=false] - Value to decide whether or not to make the parent directories if they don't exist. (default: false)
     * @param {number} [opts.length] - Maximum number of bytes to read. (default: Read all bytes from content)
     * @param {boolean} [opts.rawLeaves=false] - If true, DAG leaves will contain raw file data and not be wrapped in a protobuf. (default: false)
     * @param {number} [opts.cidVersion=0] - The CID version to use when storing the data (storage keys are based on the CID, including its version). (default: 0)
     * @param {function(Error): void} [cb] - Callback function.
     * @returns {Promise<undefined> | void} When callback is provided nothing is returned.
     */
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

    /**
     * Move files.
     *
     * @param {string | Array<string>} from - Path(s) of the source to move.
     * @param {string} to - Path of the destination to move to.
     * @param {Object} opts - Options for mv.
     * @param {boolean} [opts.parents=false] - Value to decide whether or not to make the parent directories if they don't exist. (default: false)
     * @param {String} [opts.format=dag-pb] - Format of nodes to write any newly created directories as. (default: dag-pb).
     * @param {String} [opts.hashAlg] - Algorithm to use when creating CIDs for newly created directories. (default: sha2-256) {@link https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343 The list of all possible values}
     * @param {boolean} [opts.flush=true] - Value to decide whether or not to immediately flush MFS changes to disk. (default: true)
     * @param {function(Error): void} [cb] - Callback function.
     * @returns {Promise<undefined> | void} When callback is provided nothing is returned.
     * @description
     * If from has multiple values then to must be a directory.
     *
     * If from has a single value and to exists and is a directory, from will be moved into to.
     *
     * If from has a single value and to exists and is a file, from must be a file and the contents of to will be replaced with the contents of from otherwise an error will be returned.
     *
     * If from is an IPFS path, and an MFS path exists with the same name, the IPFS path will be chosen.
     *
     * All values of from will be removed after the operation is complete unless they are an IPFS path.
     */
    mv: (from, to, opts, cb) => {
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      return nodeify(methods.mv(from, to, opts), cb)
    },

    /**
     * Flush a given path's data to the disk.
     *
     * @param {string | Array<string>} [paths] - String paths to flush. (default: /)
     * @param {function(Error): void} [cb] - Callback function.
     * @returns {Promise<undefined> | void} When callback is provided nothing is returned.
     */
    flush: (paths, cb) => {
      if (typeof paths === 'function') {
        cb = paths
        paths = undefined
      }
      return nodeify(methods.flush(paths), cb)
    },

    /**
     * @typedef {Object} ListOutputFile
     * @prop {string} name - Which is the file's name.
     * @prop {string} type - Which is the object's type (directory or file).
     * @prop {number} size - The size of the file in bytes.
     * @prop {string} hash - The hash of the file.
     */

    /**
     * @typedef {Object} ListOptions
     * @prop {boolean} [long=false] - Value to decide whether or not to populate type, size and hash. (default: false)
     * @prop {string} [cidBase=base58btc] - Which number base to use to format hashes - e.g. base32, base64 etc. (default: base58btc)
     * @prop {boolean} [sort=false] - If true entries will be sorted by filename. (default: false)
     */

    /**
     * List directories in the local mutable namespace.
     *
     * @param {string} [path="/"] - String to show listing for. (default: /)
     * @param {ListOptions} [opts] - Options for list.
     * @param {function(Error, Array<ListOutputFile>): void} [cb] - Callback function.
     * @returns {Promise<Array<ListOutputFile>> | void} When callback is provided nothing is returned.
     */
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

    /**
     * Lists a directory from the local mutable namespace that is addressed by a valid IPFS Path. The list will be yielded as Readable Streams.
     *
     * @param {string} [path="/"] - String to show listing for. (default: /)
     * @param {ListOptions} [opts] - Options for list.
     * @returns {ReadableStream} It returns a Readable Stream in Object mode that will yield {@link ListOutputFile}
     */
    lsReadableStream: (path, opts = {}) => {
      const stream = toReadableStream.obj(methods.ls(path, opts))
      const through = new PassThrough({
        objectMode: true
      })
      stream.on('data', (file) => {
        through.write(mapLsFile(opts)(file))
      })
      stream.on('error', (err) => {
        through.destroy(err)
      })
      stream.on('end', (file, enc, cb) => {
        if (file) {
          file = mapLsFile(opts)(file)
        }

        through.end(file, enc, cb)
      })

      return through
    },

    /**
     * Lists a directory from the local mutable namespace that is addressed by a valid IPFS Path. The list will be yielded as PullStreams.
     *
     * @param {string} [path="/"] - String to show listing for. (default: /)
     * @param {ListOptions} [opts] - Options for list.
     * @returns {PullStream} It returns a PullStream that will yield {@link ListOutputFile}
     */
    lsPullStream: (path, opts = {}) => {
      return pull(
        toPullStream.source(methods.ls(path, opts)),
        map(mapLsFile(opts))
      )
    }
  }
}
