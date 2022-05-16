import { loadMfsRoot } from './with-mfs-root.js'
import { toPathComponents } from './to-path-components.js'
import { exporter } from 'ipfs-unixfs-exporter'
import errCode from 'err-code'
import { CID } from 'multiformats/cid'

const IPFS_PREFIX = 'ipfs'

/**
 * @typedef {import('ipfs-unixfs-exporter').UnixFSEntry} UnixFSEntry
 * @typedef {import('ipfs-unixfs-exporter').ExporterOptions} ExporterOptions
 * @typedef {import('../').MfsContext} MfsContext
 *
 * @typedef {object} FilePath
 * @property {'mfs' | 'ipfs'} type
 * @property {'file'} entryType
 * @property {number} depth
 * @property {string} mfsPath
 * @property {string} mfsDirectory
 * @property {string[]} parts
 * @property {string} path
 * @property {string} name
 * @property {CID} cid
 * @property {boolean} exists
 * @property {import('ipfs-unixfs').UnixFS} unixfs
 * @property {(options?: ExporterOptions) => AsyncIterable<Uint8Array>} content
 *
 * @typedef {object} DirectoryPath
 * @property {'mfs' | 'ipfs'} type
 * @property {'directory'} entryType
 * @property {number} depth
 * @property {string} mfsPath
 * @property {string} mfsDirectory
 * @property {string[]} parts
 * @property {string} path
 * @property {string} name
 * @property {CID} cid
 * @property {boolean} exists
 * @property {import('ipfs-unixfs').UnixFS} unixfs
 * @property {(options?: ExporterOptions) => AsyncIterable<UnixFSEntry>} content
 *
 * @typedef {object} ObjectPath
 * @property {'mfs' | 'ipfs'} type
 * @property {'object'} entryType
 * @property {number} depth
 * @property {string} mfsPath
 * @property {string} mfsDirectory
 * @property {string[]} parts
 * @property {string} path
 * @property {string} name
 * @property {CID} cid
 * @property {boolean} exists
 * @property {(options?: ExporterOptions) => AsyncIterable<any>} content
 *
 * @typedef {object} RawPath
 * @property {'mfs' | 'ipfs'} type
 * @property {'raw'} entryType
 * @property {number} depth
 * @property {string} mfsPath
 * @property {string} mfsDirectory
 * @property {string[]} parts
 * @property {string} path
 * @property {string} name
 * @property {CID} cid
 * @property {boolean} exists
 * @property {(options?: ExporterOptions) => AsyncIterable<Uint8Array>} content
 *
 * @typedef {object} IdentityPath
 * @property {'mfs' | 'ipfs'} type
 * @property {'identity'} entryType
 * @property {number} depth
 * @property {string} mfsPath
 * @property {string} mfsDirectory
 * @property {string[]} parts
 * @property {string} path
 * @property {string} name
 * @property {CID} cid
 * @property {boolean} exists
 * @property {(options?: ExporterOptions) => AsyncIterable<Uint8Array>} content
 *
 * @typedef {FilePath | DirectoryPath | ObjectPath | RawPath | IdentityPath} MfsPath
 */

/**
 * @param {MfsContext} context
 * @param {string | CID} path
 * @param {import('ipfs-core-types/src/utils').AbortOptions} [options]
 */
export const toMfsPath = async (context, path, options) => {
  const root = await loadMfsRoot(context, options)

  /** @type {MfsPath} */
  // @ts-expect-error fields get set later
  let output = {
    entryType: 'file'
  }

  let ipfsPath = ''

  if (CID.asCID(path)) {
    ipfsPath = `/ipfs/${path}`
  } else {
    ipfsPath = path.toString()
  }

  ipfsPath = ipfsPath.trim()
  ipfsPath = ipfsPath.replace(/(\/\/+)/g, '/')

  if (ipfsPath.endsWith('/') && ipfsPath.length > 1) {
    ipfsPath = ipfsPath.substring(0, ipfsPath.length - 1)
  }

  if (!ipfsPath) {
    throw errCode(new Error('paths must not be empty'), 'ERR_NO_PATH')
  }

  if (ipfsPath.substring(0, 1) !== '/') {
    throw errCode(new Error('paths must start with a leading slash'), 'ERR_INVALID_PATH')
  }

  if (ipfsPath.substring(ipfsPath.length - 1) === '/') {
    ipfsPath = ipfsPath.substring(0, ipfsPath.length - 1)
  }

  const pathComponents = toPathComponents(ipfsPath)

  if (pathComponents[0] === IPFS_PREFIX) {
    // e.g. /ipfs/QMfoo or /ipfs/Qmfoo/sub/path
    let mfsDirectory

    if (pathComponents.length === 2) {
      mfsDirectory = `/${pathComponents.join('/')}`
    } else {
      mfsDirectory = `/${pathComponents.slice(0, pathComponents.length - 1).join('/')}`
    }

    // @ts-expect-error fields being set
    output = {
      type: 'ipfs',
      depth: pathComponents.length - 2,
      entryType: 'file',

      mfsPath: `/${pathComponents.join('/')}`,
      mfsDirectory,
      parts: pathComponents,
      path: `/${pathComponents.join('/')}`,
      name: pathComponents[pathComponents.length - 1]
    }
  } else {
    const mfsPath = `/${IPFS_PREFIX}/${root}${pathComponents.length ? '/' + pathComponents.join('/') : ''}`
    const mfsDirectory = `/${IPFS_PREFIX}/${root}/${pathComponents.slice(0, pathComponents.length - 1).join('/')}`

    // @ts-expect-error fields being set
    output = {
      type: 'mfs',
      depth: pathComponents.length,
      entryType: 'file',

      mfsDirectory,
      mfsPath,
      parts: pathComponents,
      path: `/${pathComponents.join('/')}`,
      name: pathComponents[pathComponents.length - 1]
    }
  }

  const cidPath = output.type === 'mfs' ? output.mfsPath : output.path

  try {
    const res = await exporter(cidPath, context.repo.blocks, options)

    output.cid = res.cid
    output.mfsPath = `/ipfs/${res.path}`
    output.entryType = res.type
    output.content = res.content

    if ((output.entryType === 'file' || output.entryType === 'directory') && (res.type === 'file' || res.type === 'directory')) {
      output.unixfs = res.unixfs
    }
  } catch (/** @type {any} */ err) {
    if (err.code !== 'ERR_NOT_FOUND') {
      throw err
    }
  }

  output.exists = Boolean(output.cid)

  return output
}
