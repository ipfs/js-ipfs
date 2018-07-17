'use strict'

const CID = require('cids')
const log = require('debug')('ipfs:mfs:utils:traverse-to')
const UnixFS = require('ipfs-unixfs')
const waterfall = require('async/waterfall')
const reduce = require('async/reduce')
const withMfsRoot = require('./with-mfs-root')
const validatePath = require('./validate-path')
const addLink = require('./add-link')
const {
  FILE_SEPARATOR
} = require('./constants')
const createNode = require('./create-node')

const defaultOptions = {
  parents: false,
  flush: true,
  createLastComponent: false,
  withCreateHint: true
}

const traverseTo = (ipfs, path, options, callback) => {
  options = Object.assign({}, defaultOptions, options)

  log('Traversing to', path)

  waterfall([
    (cb) => validatePath(path, cb),
    (path, cb) => {
      if (path.type === 'mfs') {
        return traverseToMfsObject(ipfs, path, options, cb)
      }

      return traverseToIpfsObject(ipfs, path, options, cb)
    }
  ], callback)
}

const traverseToIpfsObject = (ipfs, path, options, callback) => {
  log('IPFS', path)

  waterfall([
    (cb) => ipfs.dag.get(path.path, cb),
    (result, cb) => cb(null, {
      name: path.name,
      node: result && result.value,
      parent: null
    })
  ], callback)
}

const traverseToMfsObject = (ipfs, path, options, callback) => {
  waterfall([
    (done) => withMfsRoot(ipfs, done),
    (root, done) => {
      const pathSegments = path.path
        .split(FILE_SEPARATOR)
        .filter(Boolean)

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
            const existingLink = parent.node.links.find(link => link.name === pathSegment)

            if (!existingLink) {
              const lastComponent = index === pathSegments.length - 1

              log(`index ${index} pathSegments.length ${pathSegments.length} pathSegment ${pathSegment} lastComponent ${lastComponent}`, options)

              if (lastComponent && !options.createLastComponent) {
                return done(new Error(`Path ${path.path} did not exist`))
              } else if (!lastComponent && !options.parents) {
                let message = `Cannot find ${path.path} - ${pathSegment} did not exist`

                if (options.withCreateHint) {
                  message += ': Try again with the --parents flag to create it'
                }

                return done(new Error(message))
              }

              log(`Adding empty directory '${pathSegment}' to parent ${parent.name}`)

              return waterfall([
                (next) => createNode(ipfs, new UnixFS('directory').marshal(), [], options, next),
                (emptyDirectory, next) => {
                  addLink(ipfs, {
                    parent: parent.node,
                    child: emptyDirectory,
                    name: pathSegment,
                    flush: options.flush
                  }, (error, updatedParent) => {
                    parent.node = updatedParent

                    next(error, {
                      name: pathSegment,
                      node: emptyDirectory,
                      cid: new CID(emptyDirectory.multihash),
                      parent: parent
                    })
                  })
                }
              ], (error, child) => {
                trail.push(child)

                done(error, child)
              })
            }

            let hash = existingLink.hash || existingLink.multihash
            const cid = new CID(hash)

            // child existed, fetch it
            ipfs.dag.get(cid, (error, result) => {
              if (error) {
                return done(error)
              }

              const node = result.value

              const child = {
                name: pathSegment,
                node,
                parent: parent
              }

              trail.push(child)

              done(null, child)
            })
          }, cb)
        }
      ], done)
    }
  ], callback)
}

module.exports = traverseTo
