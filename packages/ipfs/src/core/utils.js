'use strict'

const isIpfs = require('is-ipfs')
const CID = require('cids')
const { Buffer } = require('buffer')
const TimeoutController = require('timeout-abort-controller')
const anySignal = require('any-signal')
const parseDuration = require('parse-duration').default
const Key = require('interface-datastore').Key
const { TimeoutError } = require('./errors')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

const ERR_BAD_PATH = 'ERR_BAD_PATH'

exports.OFFLINE_ERROR = 'This command must be run in online mode. Try running \'ipfs daemon\' first.'

exports.MFS_FILE_TYPES = {
  file: 0,
  directory: 1,
  'hamt-sharded-directory': 1
}
exports.MFS_ROOT_KEY = new Key('/local/filesroot')
exports.MFS_MAX_CHUNK_SIZE = 262144
exports.MFS_MAX_LINKS = 174

/**
 * Returns a well-formed ipfs Path.
 * The returned path will always be prefixed with /ipfs/ or /ipns/.
 *
 * @param  {String} pathStr An ipfs-path, or ipns-path or a cid
 * @return {String} ipfs-path or ipns-path
 * @throws on an invalid @param ipfsPath
 */
const normalizePath = (pathStr) => {
  if (isIpfs.cid(pathStr)) {
    return `/ipfs/${new CID(pathStr)}`
  } else if (isIpfs.path(pathStr)) {
    return pathStr
  } else {
    throw Object.assign(new Error(`invalid path: ${pathStr}`), { code: ERR_BAD_PATH })
  }
}

// TODO: do we need both normalizePath and normalizeCidPath?
const normalizeCidPath = (path) => {
  if (Buffer.isBuffer(path)) {
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
 *  - <base58 string>
 *  - <base58 string>/link/to/venus
 *  - /ipfs/<base58 string>/link/to/pluto
 *  - multihash Buffer
 *  - Arrays of the above
 *
 * @param {Dag} dag The IPFS dag api
 * @param {Array<CID|string>} ipfsPaths A single or collection of ipfs-paths
 * @param {Object} [options] Optional options passed directly to dag.resolve
 * @return {Promise<Array<CID>>}
 */
const resolvePath = async function (dag, ipfsPaths, options) {
  options = options || {}

  if (!Array.isArray(ipfsPaths)) {
    ipfsPaths = [ipfsPaths]
  }

  const cids = []

  for (const ipfsPath of ipfsPaths) {
    if (isIpfs.cid(ipfsPath)) {
      cids.push(new CID(ipfsPath))
      continue
    }

    const {
      cid,
      path
    } = toCidAndPath(ipfsPath)

    if (!path) {
      cids.push(cid)
      continue
    }

    const result = await dag.resolve(cid, {
      ...options,
      path
    })

    if (CID.isCID(result.cid)) {
      cids.push(result.cid)
    }
  }

  return cids
}

const mapFile = (file, options) => {
  options = options || {}

  const output = {
    cid: file.cid,
    path: file.path,
    name: file.name,
    depth: file.path.split('/').length,
    size: 0,
    type: 'file'
  }

  if (file.unixfs) {
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

function withTimeoutOption (fn, optionsArgIndex) {
  return (...args) => {
    const options = args[optionsArgIndex == null ? args.length - 1 : optionsArgIndex]
    if (!options || !options.timeout) return fn(...args)

    const timeout = typeof options.timeout === 'string'
      ? parseDuration(options.timeout)
      : options.timeout

    const controller = new TimeoutController(timeout)

    options.signal = anySignal([options.signal, controller.signal])

    const fnRes = fn(...args)
    const timeoutPromise = new Promise((resolve, reject) => {
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
