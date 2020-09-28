'use strict'

const loadMfsRoot = require('./with-mfs-root')
const toPathComponents = require('./to-path-components')
const exporter = require('ipfs-unixfs-exporter')
const errCode = require('err-code')
const CID = require('cids')

const IPFS_PREFIX = 'ipfs'

const toMfsPath = async (context, path, options) => {
  const outputArray = Array.isArray(path)
  let paths = Array.isArray(path) ? path : [path]
  const root = await loadMfsRoot(context, options)

  paths = paths.map(path => {
    if (CID.isCID(path)) {
      path = `/ipfs/${path}`
    }

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

      return {
        type: 'ipfs',
        depth: pathComponents.length - 2,

        mfsPath: `/${pathComponents.join('/')}`,
        mfsDirectory,
        parts: pathComponents,
        path: `/${pathComponents.join('/')}`,
        name: pathComponents[pathComponents.length - 1]
      }
    }

    const mfsPath = `/${IPFS_PREFIX}/${root}${pathComponents.length ? '/' + pathComponents.join('/') : ''}`
    const mfsDirectory = `/${IPFS_PREFIX}/${root}/${pathComponents.slice(0, pathComponents.length - 1).join('/')}`

    return {
      type: 'mfs',
      depth: pathComponents.length,

      mfsDirectory,
      mfsPath,
      parts: pathComponents,
      path: `/${pathComponents.join('/')}`,
      name: pathComponents[pathComponents.length - 1]
    }
  })

  await Promise.all(
    paths.map(async (path) => {
      const cidPath = path.type === 'mfs' ? path.mfsPath : path.path

      try {
        const res = await exporter(cidPath, context.ipld)

        path.cid = res.cid
        path.mfsPath = `/ipfs/${res.path}`
        path.unixfs = res.unixfs
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
    return paths
  }

  return paths[0]
}

module.exports = toMfsPath
