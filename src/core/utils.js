'use strict'

const Key = require('interface-datastore').Key
const bs58 = require('bs58')
const CID = require('cids')
const log = require('debug')('mfs:utils')
const UnixFS = require('ipfs-unixfs')
const dagPb = require('ipld-dag-pb')
const {
  DAGNode,
  DAGLink
} = dagPb
const {
  waterfall,
  reduce,
  doWhilst
} = require('async')

const MFS_ROOT_KEY = new Key('/local/filesroot')
const FILE_SEPARATOR = '/'

const validatePath = (path) => {
  path = (path || '').trim()

  if (!path) {
    throw new Error('paths must not be empty')
  }

  if (path.substring(0, 1) !== FILE_SEPARATOR) {
    throw new Error(`paths must start with a leading ${FILE_SEPARATOR}`)
  }

  if (path.substring(path.length - FILE_SEPARATOR.length) === FILE_SEPARATOR) {
    path = path.substring(0, path.length - FILE_SEPARATOR.length)
  }

  return path
}

const withMfsRoot = (ipfs, callback) => {
  const repo = ipfs._repo
  const datastore = repo && repo.datastore

  if (!repo || !datastore) {
    return callback(new Error('Please run jsipfs init first'))
  }

  waterfall([
    // Open the repo if it's been closed
    (cb) => repo.closed ? datastore.open(cb) : cb(),
    (cb) => {
      // Load the MFS root CID
      datastore.get(MFS_ROOT_KEY, (error, result) => {
        if (error && error.notFound) {
          log('Creating new mfs root')

          return waterfall([
            // Store an empty node as the root
            (next) => ipfs.files.add({
              path: '/'
            }, next),
            // Turn the hash into a Buffer
            ([{hash}], next) => next(null, bs58.decode(hash)),
            (buffer, next) => repo.closed ? datastore.open((error) => next(error, buffer)) : next(null, buffer),
            // Store the Buffer in the datastore
            (buffer, next) => datastore.put(MFS_ROOT_KEY, buffer, (error) => next(error, buffer))
          ], cb)
        }

        cb(error, result)
      })
    },
    // Turn the Buffer into a CID
    (hash, cb) => cb(null, new CID(hash))
    // Invoke the API function with the root CID
  ], callback)
}

const updateMfsRoot = (ipfs, buffer, callback) => {
  const repo = ipfs._repo
  const datastore = repo && repo.datastore

  if (!repo || !datastore) {
    return callback(new Error('Please run jsipfs init first'))
  }

  if (!Buffer.isBuffer(buffer)) {
    buffer = bs58.encode(buffer)
  }

  waterfall([
    (cb) => repo.closed ? datastore.open(cb) : cb(),
    (cb) => datastore.put(MFS_ROOT_KEY, buffer, cb)
  ], (error) => callback(error, buffer))
}

const addLink = (ipfs, options, callback) => {
  options = Object.assign({}, {
    parent: undefined,
    child: undefined,
    name: undefined,
    flush: true
  }, options)

  if (!options.parent) {
    return callback(new Error('No parent passed to addLink'))
  }

  if (!options.child) {
    return callback(new Error('No child passed to addLink'))
  }

  if (!options.name) {
    return callback(new Error('No name passed to addLink'))
  }

  waterfall([
    (done) => {
      // Remove the old link if necessary
      DAGNode.rmLink(options.parent, options.name, done)
    },
    (parent, done) => {
      // Add the new link to the parent
      DAGNode.addLink(parent, new DAGLink(options.name, options.child.size, options.child.hash || options.child.multihash), done)
    },
    (parent, done) => {
      if (!options.flush) {
        return done()
      }

      // Persist the new parent DAGNode
      ipfs.dag.put(parent, {
        cid: new CID(parent.hash || parent.multihash)
      }, (error) => done(error, parent))
    }
  ], callback)
}

const traverseTo = (ipfs, path, options, callback) => {
  options = Object.assign({}, {
    parents: false,
    flush: true
  }, options)

  waterfall([
    (done) => withMfsRoot(ipfs, done),
    (root, done) => {
      const pathSegments = validatePath(path)
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

            log(`Looking for ${pathSegment} in ${parent.name}`)

            if (!existingLink) {
              if (!options.parents) {
                return done(new Error(`Cannot traverse to ${path} - '${pathSegment}' did not exist: Try again with the --parents flag`))
              }

              log(`Adding empty directory '${pathSegment}' to parent ${parent.name}`)

              return waterfall([
                (next) => DAGNode.create(new UnixFS('directory').marshal(), [], next),
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
                      parent: parent
                    })
                  })
                }
              ], done)
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
        }
      ], done)
    }
  ], callback)
}

const updateTree = (ipfs, child, callback) => {
  doWhilst(
    (next) => {
      if (!child.parent) {
        const lastChild = child
        child = null
        return next(null, lastChild)
      }

      addLink(ipfs, {
        parent: child.parent.node,
        child: child.node,
        name: child.name,
        flush: true
      }, (error, updatedParent) => {
        child.parent.node = updatedParent

        const lastChild = child
        child = child.parent

        next(error, lastChild)
      })
    },
    () => Boolean(child),
    callback
  )
}

module.exports = {
  validatePath,
  withMfsRoot,
  updateMfsRoot,
  traverseTo,
  addLink,
  updateTree,
  FILE_SEPARATOR
}
