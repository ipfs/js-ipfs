'use strict'

const loadMfsRoot = require('./with-mfs-root')
const toPathComponents = require('./to-path-components')
const exporter = require('ipfs-unixfs-exporter')
const errCode = require('err-code')

const IPFS_PREFIX = 'ipfs'

/**
 * @typedef {import('cids')} CID
 * @typedef {import('../../init').IPLD} IPLD
 * @typedef {import('../../init').IPFSRepo} Repo
 * @typedef {import('ipfs-unixfs-exporter').UnixFSValue} UnixFSValue
 * @typedef {import('ipfs-unixfs-exporter').ExporterEntry} ExporterEntry
 * @typedef {Pick<ExporterEntry, 'content'>} Content
 */

/**
 * @typedef {Object} PathInfo
 * @property {'ipfs'|'mfs'} type
 * @property {number} depth
 * @property {string} mfsPath
 * @property {CID} cid
 * @property {string} mfsDirectory
 * @property {string[]} parts
 * @property {string} path
 * @property {string} name
 * @property {boolean} exists
 * @property {UnixFSValue|void} unixfs
 * @property {Content|void} content
 *
 * @typedef {Object} Context
 * @property {IPLD} ipld
 * @property {Repo} repo
 */

/**
 * @callback ToOneMFSPath
 * @param {Context} context
 * @param {string|CID} input
 * @returns {Promise<PathInfo>}
 */

/**
 * @callback ToManyMFSPaths
 * @param {Context} context
 * @param {string[]|CID[]} input
 * @returns {Promise<PathInfo[]>}
 */

/**
 * @typedef {ToOneMFSPath & ToManyMFSPaths} ToMFSPaths
 */

/** @type {ToMFSPaths} */
// @ts-ignore
const toMfsPath =
/**
 * @param {Context} context
 * @param {string|string[]} input
 * @returns {Promise<PathInfo|PathInfo[]>}
 */
async (context, input) => {
  const outputArray = Array.isArray(input)
  /** @type {string[]} */
  const paths = Array.isArray(input) ? input : [input]
  const root = await loadMfsRoot(context)

  const details = paths.map(path => {
    path = (path || '').trim()
    path = path.replace(/(\/\/+)/g, '/')

    if (path.endsWith('/') && path.length > 1) {
      path = path.substring(0, path.length - 1)
    }

    if (!path) {
      throw errCode(new Error('paths must not be empty'), 'ERR_NO_PATH')
    }

    if (path.substring(0, 1) !== '/') {
      throw errCode(new Error('paths must start with a leading slash'), 'ERR_INVALID_PATH')
    }

    if (path.substring(path.length - 1) === '/') {
      path = path.substring(0, path.length - 1)
    }

    const pathComponents = toPathComponents(path)

    if (pathComponents[0] === IPFS_PREFIX) {
      // e.g. /ipfs/QMfoo or /ipfs/Qmfoo/sub/path
      let mfsDirectory

      if (pathComponents.length === 2) {
        mfsDirectory = `/${pathComponents.join('/')}`
      } else {
        mfsDirectory = `/${pathComponents.slice(0, pathComponents.length - 1).join('/')}`
      }

      return /** @type {PathInfo} */ ({
        type: 'ipfs',
        depth: pathComponents.length - 2,

        mfsPath: `/${pathComponents.join('/')}`,
        mfsDirectory,
        parts: pathComponents,
        path: `/${pathComponents.join('/')}`,
        name: pathComponents[pathComponents.length - 1]
      })
    }

    const mfsPath = `/${IPFS_PREFIX}/${root}${pathComponents.length ? '/' + pathComponents.join('/') : ''}`
    const mfsDirectory = `/${IPFS_PREFIX}/${root}/${pathComponents.slice(0, pathComponents.length - 1).join('/')}`

    return /** @type {PathInfo} */ ({
      type: 'mfs',
      depth: pathComponents.length,

      mfsDirectory,
      mfsPath,
      parts: pathComponents,
      path: `/${pathComponents.join('/')}`,
      name: pathComponents[pathComponents.length - 1]
    })
  })

  await Promise.all(
    details.map(async (path) => {
      const cidPath = path.type === 'mfs' ? path.mfsPath : path.path

      try {
        const res = await exporter(cidPath, context.ipld)

        path.cid = res.cid
        path.mfsPath = `/ipfs/${res.path}`
        path.unixfs = res.unixfs
        // @ts-ignore - not sure what is TS complaining about here
        path.content = res.content
      } catch (err) {
        if (err.code !== 'ERR_NOT_FOUND') {
          throw err
        }
      }

      path.exists = Boolean(path.cid)
    })
  )

  if (outputArray) {
    return details
  }

  return details[0]
}

module.exports = toMfsPath
