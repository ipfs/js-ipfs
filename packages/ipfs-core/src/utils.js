/* eslint-disable no-unreachable */
'use strict'

const isIpfs = require('is-ipfs')
const CID = require('cids')
const TimeoutController = require('timeout-abort-controller')
const { anySignal } = require('any-signal')
const parseDuration = require('parse-duration').default
const Key = require('interface-datastore').Key
const { TimeoutError } = require('./errors')
const errCode = require('err-code')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

const ERR_BAD_PATH = 'ERR_BAD_PATH'

exports.OFFLINE_ERROR = 'This command must be run in online mode. Try running \'ipfs daemon\' first.'
exports.MFS_ROOT_KEY = new Key('/local/filesroot')
exports.MFS_MAX_CHUNK_SIZE = 262144
exports.MFS_MAX_LINKS = 174

/**
 * Returns a well-formed ipfs Path.
 * The returned path will always be prefixed with /ipfs/ or /ipns/.
 *
 * @param  {string} pathStr - An ipfs-path, or ipns-path or a cid
 * @returns {string} - ipfs-path or ipns-path
 * @throws on an invalid @param pathStr
 */
const normalizePath = (pathStr) => {
  if (isIpfs.cid(pathStr)) {
    return `/ipfs/${new CID(pathStr)}`
  } else if (isIpfs.path(pathStr)) {
    return pathStr
  } else {
    throw errCode(new Error(`invalid path: ${pathStr}`), ERR_BAD_PATH)
  }
}

// TODO: do we need both normalizePath and normalizeCidPath?
/**
 * @param {Uint8Array|CID|string} path
 * @returns {string}
 */
const normalizeCidPath = (path) => {
  if (path instanceof Uint8Array) {
    return new CID(path).toString()
  }
  if (CID.isCID(path)) {
    return path.toString()
  }
  if (path.indexOf('/ipfs/') === 0) {
    path = path.substring('/ipfs/'.length)
  }
  if (path.charAt(path.length - 1) === '/') {
    path = path.substring(0, path.length - 1)
  }
  return path
}

/**
 * Resolve various styles of an ipfs-path to the hash of the target node.
 * Follows links in the path.
 *
 * Accepts formats:
 * - <base58 string>
 * - <base58 string>/link/to/venus
 * - /ipfs/<base58 string>/link/to/pluto
 * - multihash Buffer
 *
 * @param {import('./components').DAG} dag - The IPFS dag api
 * @param {CID | string} ipfsPath - A CID or IPFS path
 * @param {Object} [options] - Optional options passed directly to dag.resolve
 * @returns {Promise<CID>}
 */
const resolvePath = async function (dag, ipfsPath, options = {}) {
  if (isIpfs.cid(ipfsPath)) {
    // @ts-ignore - CID|string seems to confuse typedef
    return new CID(ipfsPath)
  }

  const {
    cid,
    path
  } = toCidAndPath(ipfsPath)

  if (!path) {
    return cid
  }

  const result = await dag.resolve(cid, {
    ...options,
    path
  })

  return result.cid
}

/**
 * @param {InputFile|UnixFSFile} file
 * @param {Object} [options]
 * @param {boolean} [options.includeContent]
 * @returns {IPFSEntry}
 */
const mapFile = (file, options = {}) => {
  /** @type {IPFSEntry} */
  const output = {
    cid: file.cid,
    path: file.path,
    name: file.name,
    depth: file.path.split('/').length,
    size: 0,
    type: 'file'
  }

  if (file.unixfs) {
    // @ts-ignore - TS type can't be changed from File to Directory
    output.type = file.unixfs.type === 'directory' ? 'dir' : 'file'

    if (file.unixfs.type === 'file') {
      output.size = file.unixfs.fileSize()

      if (options.includeContent) {
        output.content = file.content()
      }
    }

    output.mode = file.unixfs.mode
    output.mtime = file.unixfs.mtime
  }

  return output
}

/**
 * @typedef {Object} File
 * @property {'file'} type
 * @property {CID} cid
 * @property {string} name
 * @property {string} path - File path
 * @property {AsyncIterable<Uint8Array>} [content] - File content
 * @property {number} [mode]
 * @property {MTime} [mtime]
 * @property {number} size
 * @property {number} depth
 *
 * @typedef {Object} Directory
 * @property {'dir'} type
 * @property {CID} cid
 * @property {string} name
 * @property {string} path - Directory path
 * @property {number} [mode]
 * @property {MTime} [mtime]
 * @property {number} size
 * @property {number} depth
 *
 * @typedef {File|Directory} IPFSEntry
 *
 * @typedef {Object} BaseFile
 * @property {CID} cid
 * @property {string} path
 * @property {string} name
 *
 * @typedef {Object} InputFileExt
 * @property {undefined} [unixfs]
 *
 * @typedef {BaseFile & InputFileExt} InputFile
 *
 * @typedef {Object} UnixFSeExt
 * @property {() => AsyncIterable<Uint8Array>} content
 * @property {UnixFS} unixfs
 *
 * @typedef {BaseFile & UnixFSeExt} UnixFSFile
 *
 *
 * @typedef {Object} UnixFS
 * @property {'directory'|'file'|'dir'} type
 * @property {() => number} fileSize
 * @property {() => AsyncIterable<Uint8Array>} content
 * @property {number} mode
 * @property {MTime} mtime
 *
 * @typedef {object} MTime
 * @property {number} secs - the number of seconds since (positive) or before
 * (negative) the Unix Epoch began
 * @property {number} [nsecs] - the number of nanoseconds since the last full
 * second.
 */

/**
 * @template {any[]} ARGS
 * @template R
 * @typedef {(...args: ARGS) => R} Fn
 */

/**
 * @typedef {object} AbortOptions
 * @property {number} [timeout] - A timeout in ms
 * @property {AbortSignal} [signal] - Can be used to cancel any long running requests started as a result of this call
 */

/**
 * @typedef {Object} Mtime
 * @property {number} [secs]
 * @property {number} [nsecs]
 */

/**
 * @typedef {[number, number]} Hrtime
 */

/**
 * @typedef {Object} PreloadOptions
 * @property {boolean} [preload=true]
 */

/**
 * @template {Record<string, any>} ExtraOptions
 */

/**
 * @template {any[]} ARGS
 * @template {Promise<any> | AsyncIterable<any>} R - The return type of `fn`
 * @param {Fn<ARGS, R>} fn
 * @param {number} [optionsArgIndex]
 * @returns {Fn<ARGS, R>}
 */
function withTimeoutOption (fn, optionsArgIndex) {
  // eslint-disable-next-line
  return /** @returns {R} */(/** @type {ARGS} */...args) => {
    const options = args[optionsArgIndex == null ? args.length - 1 : optionsArgIndex]
    if (!options || !options.timeout) return fn(...args)

    const timeout = typeof options.timeout === 'string'
      ? parseDuration(options.timeout)
      : options.timeout

    const controller = new TimeoutController(timeout)

    options.signal = anySignal([options.signal, controller.signal])

    const fnRes = fn(...args)
    // eslint-disable-next-line promise/param-names
    const timeoutPromise = new Promise((_resolve, reject) => {
      controller.signal.addEventListener('abort', () => {
        reject(new TimeoutError())
      })
    })

    const start = Date.now()

    const maybeThrowTimeoutError = () => {
      if (controller.signal.aborted) {
        throw new TimeoutError()
      }

      const timeTaken = Date.now() - start

      // if we have starved the event loop by adding microtasks, we could have
      // timed out already but the TimeoutController will never know because it's
      // setTimeout will not fire until we stop adding microtasks
      if (timeTaken > timeout) {
        controller.abort()
        throw new TimeoutError()
      }
    }

    if (fnRes[Symbol.asyncIterator]) {
      // @ts-ignore
      return (async function * () {
        const it = fnRes[Symbol.asyncIterator]()

        try {
          while (true) {
            const { value, done } = await Promise.race([it.next(), timeoutPromise])

            if (done) {
              break
            }

            maybeThrowTimeoutError()

            yield value
          }
        } catch (err) {
          maybeThrowTimeoutError()

          throw err
        } finally {
          controller.clear()

          if (it.return) {
            it.return()
          }
        }
      })()
    }

    // @ts-ignore
    return (async () => {
      try {
        const res = await Promise.race([fnRes, timeoutPromise])

        maybeThrowTimeoutError()

        return res
      } catch (err) {
        maybeThrowTimeoutError()

        throw err
      } finally {
        controller.clear()
      }
    })()
  }
}

exports.normalizePath = normalizePath
exports.normalizeCidPath = normalizeCidPath
exports.resolvePath = resolvePath
exports.mapFile = mapFile
exports.withTimeoutOption = withTimeoutOption
