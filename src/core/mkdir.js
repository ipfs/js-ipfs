'use strict'

const UnixFS = require('ipfs-unixfs')
const promisify = require('promisify-es6')
const CID = require('cids')
const bs58 = require('bs58')
const log = require('debug')('mfs:mkdir')
const dagPb = require('ipld-dag-pb')
const {
  DAGNode,
  DAGLink
} = dagPb
const waterfall = require('async/waterfall')
const reduce = require('async/reduce')
const {
  withMfsRoot,
  updateMfsRoot,
  validatePath,
  FILE_SEPARATOR
} = require('./utils')

const defaultOptions = {
  parents: true,
  hash: undefined,
  cidVersion: undefined
}

const addLink = (ipfs, parent, child, name, callback) => {
  waterfall([
    (done) => {
      DAGNode.rmLink(parent, name, done)
    },
    (parent, done) => {
      DAGNode.addLink(parent, new DAGLink(name, child.size, child.hash || child.multihash), done)
    },
    (parent, done) => {
      ipfs.dag.put(parent, {
        cid: new CID(parent.hash || parent.multihash)
      }, (error) => done(error, parent))
    }
  ], callback)
}

module.exports = function mfsMkdir (ipfs) {
  return promisify((path, options, callback) => {
    withMfsRoot(ipfs, (error, root) => {
      if (error) {
        return callback(error)
      }

      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = Object.assign({}, defaultOptions, options)

      if (!path) {
        return callback(new Error('no path given to Mkdir'))
      }

      const pathSegments = validatePath(path)
        .split(FILE_SEPARATOR)
        .filter(Boolean)

      if (pathSegments.length === 0) {
        return callback(options.parents ? null : new Error(`cannot create directory '${FILE_SEPARATOR}': Already exists`))
      }

      const trail = []

      waterfall([
        (cb) => ipfs.dag.get(root, cb),
        (result, cb) => {
          const rootNode = result.value

          trail.push({
            name: FILE_SEPARATOR,
            node: rootNode,
            parent: null
          })

          reduce(pathSegments.map((pathSegment, index) => ({pathSegment, index})), {
            name: FILE_SEPARATOR,
            node: rootNode,
            parent: null
          }, (parent, {pathSegment, index}, done) => {
            const lastPathSegment = index === pathSegments.length - 1
            const existingLink = parent.node.links.find(link => link.name === pathSegment)

            log(`Looking for ${pathSegment} in ${parent.name}`)

            if (!existingLink) {
              if (!lastPathSegment && !options.parents) {
                return done(new Error(`Cannot create ${path} - intermediate directory '${pathSegment}' did not exist: Try again with the --parents flag`))
              }

              log(`Adding empty directory '${pathSegment}' to parent ${parent.name}`)

              return waterfall([
                (next) => DAGNode.create(new UnixFS('directory').marshal(), [], next),
                (emptyDirectory, next) => {
                  addLink(ipfs, parent.node, emptyDirectory, pathSegment, (error, updatedParent) => {
                    parent.node = updatedParent

                    next(error, {
                      name: pathSegment,
                      node: emptyDirectory,
                      parent: parent
                    })
                  })
                }
              ], done)
            }

            if (lastPathSegment && existingLink && !options.parents) {
              return done(new Error(`Cannot create directory '${path}': Already exists`))
            }

            let hash = existingLink.hash || existingLink.multihash

            if (Buffer.isBuffer(hash)) {
              hash = bs58.encode(hash)
            }

            // child existed, fetch it
            ipfs.dag.get(hash, (error, result) => {
              const child = {
                name: pathSegment,
                node: result && result.value,
                parent: parent
              }

              trail.push(child)

              done(error, child)
            })
          }, cb)
        },
        (result, cb) => {
          // replace all links and store in the repo
          reduce(pathSegments, result, (child, pathSegment, next) => {
            addLink(ipfs, child.parent.node, child.node, child.name, (error, updatedParent) => {
              child.parent.node = updatedParent

              next(error, child.parent)
            })
          }, cb)
        },
        (result, cb) => {
          // update new MFS root CID
          updateMfsRoot(ipfs, result.node.multihash, cb)
        }
      ], callback)
    })
  })
}
