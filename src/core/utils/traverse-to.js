'use strict'

const bs58 = require('bs58')
const CID = require('cids')
const log = require('debug')('mfs:utils:traverse-to')
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

  log(`Traversing to ${path}`)

  waterfall([
    (done) => withMfsRoot(ipfs, done),
    (root, done) => {
      try {
        path = validatePath(path)
      } catch (error) {
        return done(error)
      }

      const pathSegments = path
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
            log(`Looking for ${pathSegment} in ${parent.name} ${bs58.encode(parent.node.multihash)}`)

            parent.node.links.forEach(link => {
              log(`${bs58.encode(link.multihash)} ${link.name}`)
            })

            const existingLink = parent.node.links.find(link => link.name === pathSegment)

            if (!existingLink) {
              if (index === pathSegments.length - 1 && !options.parents && !this.createLastComponent) {
                return done(new Error(`Path ${path} did not exist`))
              }

              if (!options.parents) {
                let message = `Cannot find ${path} - ${pathSegment} did not exist`

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

            // child existed, fetch it
            ipfs.dag.get(new CID(hash), (error, result) => {
              log(`Loaded ${bs58.encode(result.value.multihash)} from ${bs58.encode(hash)}`)
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
  ], (error, trail) => {
    if (!error) {
      let node = trail
      let path = []

      while (node) {
        path.push(`${node.name} ${bs58.encode(node.node.multihash)}`)
        node = node.parent
      }

      log('Path:')

      path
        .reverse()
        .forEach((segment, index) => log(segment))
    }

    callback(error, trail)
  })
}

module.exports = traverseTo
