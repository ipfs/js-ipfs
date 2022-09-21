/* eslint-disable no-unreachable */

import * as isIpfs from 'is-ipfs'
import { CID } from 'multiformats/cid'
import { Key } from 'interface-datastore/key'
import errCode from 'err-code'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { toCidAndPath } from 'ipfs-core-utils/to-cid-and-path'
import * as dagPB from '@ipld/dag-pb'

/**
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('@ipld/dag-pb').PBLink} PBLink
 */

const ERR_BAD_PATH = 'ERR_BAD_PATH'

export const OFFLINE_ERROR = 'This command must be run in online mode. Try running \'ipfs daemon\' first.'
export const MFS_ROOT_KEY = new Key('/local/filesroot')
export const MFS_MAX_CHUNK_SIZE = 262144
export const MFS_MAX_LINKS = 174

/**
 * Returns a well-formed ipfs Path.
 * The returned path will always be prefixed with /ipfs/ or /ipns/.
 *
 * @param  {string | CID} pathStr - An ipfs-path, or ipns-path or a cid
 * @returns {string} - ipfs-path or ipns-path
 * @throws on an invalid @param pathStr
 */
export const normalizePath = (pathStr) => {
  const cid = CID.asCID(pathStr)

  if (cid) {
    return `/ipfs/${pathStr}`
  }

  const str = pathStr.toString()

  try {
    return `/ipfs/${CID.parse(str)}`
  } catch {}

  if (isIpfs.path(str)) {
    return str
  } else {
    throw errCode(new Error(`invalid path: ${pathStr}`), ERR_BAD_PATH)
  }
}

// TODO: do we need both normalizePath and normalizeCidPath?
// TODO: don't forget ipfs-core-utils/src/to-cid-and-path
/**
 * @param {Uint8Array|CID|string} path
 */
export const normalizeCidPath = (path) => {
  if (path instanceof Uint8Array) {
    return CID.decode(path).toString()
  }

  path = path.toString()

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
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} codecs
 * @param {CID | string | Uint8Array} ipfsPath - A CID or IPFS path
 * @param {{ path?: string, signal?: AbortSignal }} [options] - Optional options passed directly to dag.resolve
 * @returns {Promise<{ cid: CID, remainderPath: string}>}
 */
export const resolvePath = async function (repo, codecs, ipfsPath, options = {}) {
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
        if (!CID.asCID(value)) {
          break
        }

        lastRemainderPath = remainderPath
        lastCid = value
      }
    } catch (/** @type {any} */ err) {
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
 */
export const mapFile = (file) => {
  if (file.type !== 'file' && file.type !== 'directory' && file.type !== 'raw') {
    // file.type === object | identity not supported yet
    throw new Error(`Unknown node type '${file.type}'`)
  }

  /** @type {import('ipfs-core-types/src/root').IPFSEntry} */
  const output = {
    cid: file.cid,
    path: file.path,
    name: file.name,
    size: file.size,
    type: 'file'
  }

  if (file.type === 'directory') {
    // @ts-expect-error - TS type can't be changed from File to Directory
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

  return output
}

export const withTimeout = withTimeoutOption(
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
 * @param {import('ipfs-core-utils/src/multicodecs').Multicodecs} codecs
 * @param {import('ipfs-repo').IPFSRepo} repo
 * @param {AbortOptions} [options]
 */
export const resolve = async function * (cid, path, codecs, repo, options) {
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

  // End iteration if there isn't a CID to follow any more
  while (parts.length) {
    const key = parts.shift()

    if (!key) {
      throw errCode(new Error(`Could not resolve path "${path}"`), 'ERR_INVALID_PATH')
    }

    // special case for dag-pb, use the link name as the path segment
    if (cid.code === dagPB.code && Array.isArray(value.Links)) {
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

    if (CID.asCID(value)) {
      lastCid = value
      value = await load(value)
    }
  }

  yield {
    value,
    remainderPath: ''
  }
}
