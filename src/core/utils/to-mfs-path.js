'use strict'

const {
  FILE_SEPARATOR
} = require('./constants')
const withMfsRoot = require('./with-mfs-root')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const toPathComponents = require('./to-path-components')

const IPFS_PREFIX = 'ipfs'

const toMfsPath = (context, path, callback) => {
  let outputArray = Array.isArray(path)
  const paths = Array.isArray(path) ? path : [path]

  waterfall([
    (cb) => {
      parallel({
        paths: (done) => {
          let p
          try {
            p = paths.map(path => {
              path = (path || '').trim()
              path = path.replace(/(\/\/+)/g, '/')

              if (!path) {
                throw new Error('paths must not be empty')
              }

              if (path.substring(0, 1) !== FILE_SEPARATOR) {
                throw new Error(`paths must start with a leading ${FILE_SEPARATOR}`)
              }

              if (path.substring(path.length - FILE_SEPARATOR.length) === FILE_SEPARATOR) {
                path = path.substring(0, path.length - FILE_SEPARATOR.length)
              }

              return toPathComponents(path)
            })
          } catch (err) {
            return done(err)
          }

          done(null, p)
        },
        root: (done) => withMfsRoot(context, done)
      }, cb)
    },
    ({ paths, root }, cb) => {
      cb(null, paths.map(parts => {
        if (parts[0] === IPFS_PREFIX) {
          let mfsDirectory

          if (parts.length === 2) {
            mfsDirectory = `${FILE_SEPARATOR}${parts.join(FILE_SEPARATOR)}`
          } else {
            mfsDirectory = `${FILE_SEPARATOR}${parts.slice(0, parts.length - 1).join(FILE_SEPARATOR)}`
          }

          return {
            type: 'ipfs',
            depth: parts.length - 2,

            mfsPath: `${FILE_SEPARATOR}${parts.join(FILE_SEPARATOR)}`,
            mfsDirectory,
            root,
            parts,
            path: `${FILE_SEPARATOR}${parts.join(FILE_SEPARATOR)}`,
            name: parts[parts.length - 1]
          }
        }

        const mfsPath = `/${IPFS_PREFIX}/${root.toBaseEncodedString()}/${parts.join(FILE_SEPARATOR)}`
        const mfsDirectory = `/${IPFS_PREFIX}/${root.toBaseEncodedString()}/${parts.slice(0, parts.length - 1).join(FILE_SEPARATOR)}`

        return {
          type: 'mfs',
          depth: parts.length,

          mfsDirectory,
          mfsPath,
          root,
          parts,
          path: `${FILE_SEPARATOR}${parts.join(FILE_SEPARATOR)}`,
          name: parts[parts.length - 1]
        }
      }))
    },
    (mfsPaths, cb) => {
      if (outputArray) {
        return cb(null, mfsPaths)
      }

      cb(null, mfsPaths[0])
    }
  ], callback)
}

module.exports = toMfsPath
