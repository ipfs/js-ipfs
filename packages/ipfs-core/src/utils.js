/* eslint-disable no-unreachable */
'use strict'

const isIpfs = require('is-ipfs')
const { CID } = require('multiformats/cid')
const Key = require('interface-datastore').Key
const errCode = require('err-code')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')
const dagPb = require('@ipld/dag-pb')

/**
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('@ipld/dag-pb').PBLink} PBLink
 */

const ERR_BAD_PATH = 'ERR_BAD_PATH'

/**
 * Returns a well-formed ipfs Path.
 * The returned path will always be prefixed with /ipfs/ or /ipns/.
 *
 * @param  {string | CID} pathStr - An ipfs-path, or ipns-path or a cid
 * @returns {string} - ipfs-path or ipns-path
 * @throws on an invalid @param pathStr
 */
const normalizePath = (pathStr) => {
  if (pathStr instanceof CID) {
    return `/ipfs/${pathStr}`
  }

  try {
    CID.parse(pathStr)
    pathStr = `/ipfs/${pathStr}`
  } catch {}

  if (isIpfs.path(pathStr)) {
    return pathStr
  } else {
    throw errCode(new Error(`invalid path: ${pathStr}`), ERR_BAD_PATH)
  }
}

// TODO: do we need both normalizePath and normalizeCidPath?
// TODO: don't forget ipfs-core-utils/src/to-cid-and-path
/**
 * @param {Uint8Array|CID|string} path
 * @returns {string}
 */
const normalizeCidPath = (path) => {
  if (path instanceof Uint8Array) {
    return CID.decode(path).toString()
  }
  if (path instanceof CID) {
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
 * Follows links in the path
 *
 * @param {import('ipfs-repo').IPFSRepo} repo
 * @param {import('ipfs-core-utils/src/multicodecs')} codecs
 * @param {CID | string} ipfsPath - A CID or IPFS path
 * @param {{ path?: string, signal?: AbortSignal }} [options] - Optional options passed directly to dag.resolve
 * @returns {Promise<{ cid: CID, remainderPath: string}>}
 */
const resolvePath = async function (repo, codecs, ipfsPath, options = {}) {
  const {
    cid,
    path
  } = toCidAndPath(ipfsPath)

  if (path) {
    options.path = path
  }

  let lastCid = cid
  let lastRemainderPath = options.path || ''

  if (lastRemainderPath.startsWith('/')) {
    lastRemainderPath = lastRemainderPath.substring(1)
  }

  if (options.path) {
    try {
      for await (const { value, remainderPath } of resolve(cid, options.path, codecs, repo, {
        signal: options.signal
      })) {
        if (!(value instanceof CID)) {
          break
        }

        lastRemainderPath = remainderPath
        lastCid = value
      }
    } catch (err) {
      // TODO: add error codes to IPLD
      if (err.message.startsWith('Object has no property')) {
        err.message = `no link named "${lastRemainderPath.split('/')[0]}" under ${lastCid}`
        err.code = 'ERR_NO_LINK'
      }
      throw err
    }
  }

  return {
    cid: lastCid,
    remainderPath: lastRemainderPath || ''
  }
}

/**
 * @typedef {import('ipfs-unixfs-exporter').UnixFSEntry} UnixFSEntry
 *
 * @param {UnixFSEntry} file
 * @param {Object} [options]
 * @param {boolean} [options.includeContent]
 */
const mapFile = (file, options = {}) => {
  if (file.type !== 'file' && file.type !== 'directory' && file.type !== 'raw') {
    // file.type === object | identity not supported yet
    throw new Error(`Unknown node type '${file.type}'`)
  }

  /** @type {import('ipfs-core-types/src/root').IPFSEntry} */
  const output = {
    cid: file.cid,
    path: file.path,
    name: file.name,
    depth: file.path.split('/').length,
    size: file.size,
    type: 'file'
  }

  if (file.type === 'directory') {
    // @ts-ignore - TS type can't be changed from File to Directory
    output.type = 'dir'
  }

  if (file.type === 'file') {
    output.size = file.unixfs.fileSize()
  }

  if (file.type === 'file' || file.type === 'directory') {
    output.mode = file.unixfs.mode

    if (file.unixfs.mtime !== undefined) {
      output.mtime = file.unixfs.mtime
    }
  }

  if (options.includeContent) {
    if (file.type === 'file' || file.type === 'raw') {
      // @ts-expect-error - content is readonly
      output.content = file.content()
    }
  }

  return output
}

const withTimeout = withTimeoutOption(
  /**
   * @template T
   * @param {Promise<T>|T} promise
   * @param {AbortOptions} [_options]
   * @returns {Promise<T>}
   */
  async (promise, _options) => await promise
)

/**
 * Retrieves IPLD Nodes along the `path` that is rooted at `cid`.
 *
 * @param {CID} cid - the CID where the resolving starts
 * @param {string} path - the path that should be resolved
 * @param {import('ipfs-core-utils/src/multicodecs')} codecs
 * @param {import('ipfs-repo').IPFSRepo} repo
 * @param {AbortOptions} [options]
 */
const resolve = async function * (cid, path, codecs, repo, options) {
  /**
   * @param {CID} cid
   */
  const load = async (cid) => {
    const codec = await codecs.getCodec(cid.code)
    const block = await repo.blocks.get(cid, options)

    return codec.decode(block)
  }

  const parts = path.split('/').filter(Boolean)
  let value = await load(cid)
  let lastCid = cid

  if (!parts.length) {
    yield {
      value,
      remainderPath: ''
    }
  }

  // End iteration if there isn't a CID to follow any more
  while (parts.length) {
    const key = parts.shift()

    if (!key) {
      throw errCode(new Error(`Could not resolve path "${path}"`), 'ERR_INVALID_PATH')
    }

    // special case for dag-pb, use the link name as the path segment
    if (cid.code === dagPb.code && Array.isArray(value.Links)) {
      const link = value.Links.find((/** @type {PBLink} */ l) => l.Name === key)

      if (link) {
        yield {
          value: link.Hash,
          remainderPath: parts.join('/')
        }

        value = await load(link.Hash)
        lastCid = link.Hash

        continue
      }
    }

    if (Object.prototype.hasOwnProperty.call(value, key)) {
      value = value[key]

      yield {
        value,
        remainderPath: parts.join('/')
      }
    } else {
      throw errCode(new Error(`no link named "${key}" under ${lastCid}`), 'ERR_NO_LINK')
    }

    if (value instanceof CID) {
      lastCid = value
      value = await load(value)
    }
  }
}

module.exports = {
  normalizePath,
  normalizeCidPath,
  resolvePath,
  mapFile,
  withTimeout,
  resolve,

  OFFLINE_ERROR: 'This command must be run in online mode. Try running \'ipfs daemon\' first.',
  MFS_ROOT_KEY: new Key('/local/filesroot'),
  MFS_MAX_CHUNK_SIZE: 262144,
  MFS_MAX_LINKS: 174
}
