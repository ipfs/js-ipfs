'use strict'

const {
  FILE_SEPARATOR
} = require('./constants')
const loadMfsRoot = require('./with-mfs-root')
const toPathComponents = require('./to-path-components')
const exporter = require('ipfs-unixfs-exporter')
const errCode = require('err-code')

const IPFS_PREFIX = 'ipfs'

const toMfsPath = async (context, path) => {
  const outputArray = Array.isArray(path)
  let paths = Array.isArray(path) ? path : [path]
  const root = await loadMfsRoot(context)

  paths = paths.map(path => {
    path = (path || '').trim()
    path = path.replace(/(\/\/+)/g, '/')

    if (path.endsWith('/') && path.length > 1) {
      path = path.substring(0, path.length - 1)
    }

    if (!path) {
      throw errCode(new Error('paths must not be empty'), 'ERR_NO_PATH')
    }

    if (path.substring(0, 1) !== FILE_SEPARATOR) {
      throw errCode(new Error(`paths must start with a leading ${FILE_SEPARATOR}`), 'ERR_INVALID_PATH')
    }

    if (path.substring(path.length - FILE_SEPARATOR.length) === FILE_SEPARATOR) {
      path = path.substring(0, path.length - FILE_SEPARATOR.length)
    }

    const pathComponents = toPathComponents(path)

    if (pathComponents[0] === IPFS_PREFIX) {
      // e.g. /ipfs/QMfoo or /ipfs/Qmfoo/sub/path
      let mfsDirectory

      if (pathComponents.length === 2) {
        mfsDirectory = `${FILE_SEPARATOR}${pathComponents.join(FILE_SEPARATOR)}`
      } else {
        mfsDirectory = `${FILE_SEPARATOR}${pathComponents.slice(0, pathComponents.length - 1).join(FILE_SEPARATOR)}`
      }

      return {
        type: 'ipfs',
        depth: pathComponents.length - 2,

        mfsPath: `${FILE_SEPARATOR}${pathComponents.join(FILE_SEPARATOR)}`,
        mfsDirectory,
        parts: pathComponents,
        path: `${FILE_SEPARATOR}${pathComponents.join(FILE_SEPARATOR)}`,
        name: pathComponents[pathComponents.length - 1]
      }
    }

    const mfsPath = `/${IPFS_PREFIX}/${root}${pathComponents.length ? '/' + pathComponents.join(FILE_SEPARATOR) : ''}`
    const mfsDirectory = `/${IPFS_PREFIX}/${root}/${pathComponents.slice(0, pathComponents.length - 1).join(FILE_SEPARATOR)}`

    return {
      type: 'mfs',
      depth: pathComponents.length,

      mfsDirectory,
      mfsPath,
      parts: pathComponents,
      path: `${FILE_SEPARATOR}${pathComponents.join(FILE_SEPARATOR)}`,
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
