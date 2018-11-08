'use strict'

const CID = require('cids')
const log = require('debug')('ipfs:mfs:utils:traverse-to')
const UnixFS = require('ipfs-unixfs')
const waterfall = require('async/waterfall')
const reduce = require('async/reduce')
const {
  DAGNode
} = require('ipld-dag-pb')
const withMfsRoot = require('./with-mfs-root')
const validatePath = require('./validate-path')
const addLink = require('./add-link')
const {
  FILE_SEPARATOR
} = require('./constants')
const {
  NonFatalError
} = require('./errors')

const defaultOptions = {
  parents: false,
  flush: true,
  createLastComponent: false,
  withCreateHint: true,
  cidVersion: 0,
  format: 'dag-pb',
  hashAlg: 'sha2-256'
}

const traverseTo = (context, path, options, callback) => {
  options = Object.assign({}, defaultOptions, options)

  log('Traversing to', path)

  waterfall([
    (cb) => validatePath(path, cb),
    (path, cb) => {
      if (path.type === 'mfs') {
        return traverseToMfsObject(context, path, options, cb)
      }

      return traverseToIpfsObject(context, path, options, cb)
    }
  ], callback)
}

const traverseToIpfsObject = (context, path, options, callback) => {
  log('IPFS', path)

  const cid = new CID(path.path)

  waterfall([
    (cb) => context.ipld.get(cid, cb),
    (result, cb) => cb(null, {
      name: path.name,
      node: result && result.value,
      parent: null,
      cid
    })
  ], callback)
}

const traverseToMfsObject = (context, path, options, callback) => {
  waterfall([
    (done) => withMfsRoot(context, done),
    (root, done) => {
      const pathSegments = path.path
        .split(FILE_SEPARATOR)
        .filter(Boolean)

      const trail = []

      waterfall([
        (cb) => context.ipld.get(root, cb),
        (result, cb) => {
          const rootNode = result.value

          trail.push({
            name: FILE_SEPARATOR,
            node: rootNode,
            parent: null,
            cid: root
          })

          reduce(pathSegments.map((pathSegment, index) => ({ pathSegment, index })), {
            name: FILE_SEPARATOR,
            node: rootNode,
            parent: null,
            cid: root
          }, (parent, { pathSegment, index }, done) => {
            const existingLink = parent.node.links.find(link => link.name === pathSegment)

            if (!existingLink) {
              const lastComponent = index === pathSegments.length - 1

              log(`index ${index} pathSegments.length ${pathSegments.length} pathSegment ${pathSegment} lastComponent ${lastComponent}`, options)

              if (lastComponent && !options.createLastComponent) {
                log(`Last segment of ${path.path} did not exist`)
                return done(new NonFatalError('file does not exist'))
              } else if (!lastComponent && !options.parents) {
                log(`Cannot traverse to ${path.path} - ${pathSegment} did not exist`)
                return done(new NonFatalError('file does not exist'))
              }

              log(`Adding empty directory '${pathSegment}' to parent ${parent.name}`)

              return waterfall([
                (next) => createNode(context, new UnixFS('directory').marshal(), [], options, next),
                (emptyDirectory, next) => {
                  addLink(context, {
                    parent: parent.node,
                    size: emptyDirectory.node.size,
                    cid: emptyDirectory.cid,
                    name: pathSegment,
                    flush: options.flush
                  }, (error, result) => {
                    if (error) {
                      return next(error)
                    }

                    parent.node = result.node
                    parent.cid = result.cid

                    next(null, {
                      name: pathSegment,
                      node: emptyDirectory.node,
                      cid: emptyDirectory.cid,
                      parent: parent
                    })
                  })
                }
              ], (error, child) => {
                trail.push(child)

                done(error, child)
              })
            }

            // child existed, fetch it
            context.ipld.get(existingLink.cid, (error, result) => {
              if (error) {
                return done(error)
              }

              const node = result.value

              const child = {
                name: pathSegment,
                node,
                parent: parent,
                cid: existingLink.cid
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

const createNode = (context, data, links, options, callback) => {
  options = Object.assign({}, defaultOptions, options)

  waterfall([
    // Create a DAGNode with the new data
    (cb) => DAGNode.create(data, links, cb),
    (newNode, cb) => {
      // Persist it
      context.ipld.put(newNode, {
        version: options.cidVersion,
        format: options.format,
        hashAlg: options.hashAlg
      }, (error, cid) => cb(error, {
        node: newNode,
        cid
      }))
    }
  ], callback)
}

module.exports = traverseTo
