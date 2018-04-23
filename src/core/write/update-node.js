'use strict'

const UnixFs = require('ipfs-unixfs')
const {
  unmarshal
} = UnixFs
const pull = require('pull-stream/pull')
const values = require('pull-stream/sources/values')
const collect = require('pull-stream/sinks/collect')
const asyncMap = require('pull-stream/throughs/async-map')
const filter = require('pull-stream/throughs/filter')
const paramap = require('pull-paramap')
const {
  leafFirst
} = require('pull-traverse')
const waterfall = require('async/waterfall')
const CID = require('cids')
const findFileSize = require('./find-file-size')
const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')
const log = require('debug')('mfs:write:update-node')
const bs58 = require('bs58')
const {
  limitStreamBytes
} = require('../utils')

const updateNode = (ipfs, cidToUpdate, source, options, callback) => {
  let offset = options.offset || 0

  // Where we want to start writing in the stream
  let streamStart = offset

  // Where we want to stop writing in the stream
  const streamEnd = offset + options.length

  // Where we currently are in the stream
  let streamPosition = 0

  waterfall([
    (done) => ipfs.dag.get(cidToUpdate, done),
    (result, done) => {
      const node = result.value
      const fileSize = findFileSize(node)

      log(`Updating bytes ${streamStart}-${streamEnd} of ${fileSize} bytes from ${cidToUpdate.toBaseEncodedString()} with source`)

      if (streamEnd > fileSize) {
        // We are going to expand the file. this can lead to the DAG structure
        // changing so reimport the whole file instead
        //
        // Create a stream from the existing node, then switch to the
        // passed buffer when required
        log(`New bytes would expand the file and potentially reorder the DAG, reimporting instead`)

        return done(new Error('Expanding files is not implemented yet'))
      } else {
        // We are going to replace bytes in existing leaf nodes and rewrite
        // their CIDs and the CIDs of the parent nodes
        log(`Updating one or more more leaf nodes`)

        pull(
          source,
          limitStreamBytes(options.length),
          asyncMap((buffer, done) => {
            // Find the DAGNodes that contain the data at the specified offset/length
            // Merge the data and create new DAGNodes with the merged data
            // Keep a record of the new CIDs and update the tree
            pull(
              leafFirst({
                parent: null,
                link: null,
                index: null,
                node,
                nodeStart: streamPosition,
                nodeEnd: fileSize
              }, findDAGNodesWithRequestedData),
              paramap(updateNodeData(buffer)),
              filter(Boolean),
              asyncMap((link, next) => {
                if (!link.parent || !link.index) {
                  return next(null, link)
                }

                // Create a new list of links
                const links = link.parent.node.links.map((existingLink, index) => {
                  if (index === link.index) {
                    return new DAGLink('', link.size, link.multihash)
                  }

                  return existingLink
                })

                // Update node's parent
                waterfall([
                  // Create a DAGNode with the new data
                  (cb) => DAGNode.create(link.parent.node.data, links, cb),
                  (newNode, cb) => {
                    // Persist it
                    ipfs.dag.put(newNode, {
                      cid: new CID(newNode.multihash)
                    }, (error) => cb(error, newNode))
                  },
                  (newNode, cb) => {
                    link.parent.node = newNode

                    cb(null, link)
                  }
                ], next)
              }),
              collect((error, results) => {
                let updatedRoot

                if (!error) {
                  updatedRoot = results[0]

                  while (updatedRoot.parent) {
                    updatedRoot = updatedRoot.parent
                  }

                  if (updatedRoot.node) {
                    updatedRoot = updatedRoot.node
                  }
                }

                offset += buffer.length

                done(error, updatedRoot)
              })
            )
          }),
          collect((error, results) => done(error, results && results[0]))
        )
      }
    }
  ], callback)

  // Returns a pull stream that will load the data from the children of the passed node
  function findDAGNodesWithRequestedData ({ node }) {
    const meta = unmarshal(node.data)

    log(`Node links ${node.links.length}, block sizes ${meta.blockSizes}`)

    const parent = {
      node: node
    }

    // work out which child nodes contain the requested data
    const filteredLinks = node.links
      .map((link, index) => {
        const child = {
          parent,
          link: link,
          index: index,
          nodeStart: streamPosition,
          nodeEnd: streamPosition + meta.blockSizes[index]
        }

        streamPosition = child.nodeEnd

        return child
      })
      .filter((child, index) => {
        log('child.nodeStart', child.nodeStart, 'child.nodeEnd', child.nodeEnd, 'streamStart', streamStart, 'streamEnd', streamEnd)

        return (streamStart >= child.nodeStart && streamStart < child.nodeEnd) || // child has begin byte
          (streamEnd > child.nodeStart && streamEnd <= child.nodeEnd) || // child has end byte
          (streamStart < child.nodeStart && streamEnd > child.nodeEnd) // child is between begin and end bytes
      })

    if (filteredLinks.length) {
      // move stream position to the first node we're going to return data from
      streamPosition = filteredLinks[0].nodeStart

      log(`Updating links with index(es) ${filteredLinks.map(link => link.index).join(',')}`)
    } else {
      log(`No links to update`)
    }

    return pull(
      values(filteredLinks),
      paramap((child, cb) => {
        const cid = new CID(child.link.multihash)

        log(`Loading DAGNode for child ${cid.toBaseEncodedString()}, index ${child.index}`)

        ipfs.dag.get(cid, (error, result) => cb(error, Object.assign({}, child, {
          node: result && result.value
        })))
      })
    )
  }

  function updateNodeData (newContent) {
    return ({ parent, link, nodeStart, node, index }, done) => {
      if (!node || !node.data) {
        return done()
      }

      waterfall([
        (next) => next(null, unmarshal(node.data)),
        (meta, next) => {
          if (!meta || !meta.data || !meta.data.length) {
            return next()
          }

          const targetStart = streamStart - nodeStart
          const sourceStart = 0
          let sourceEnd = streamEnd - streamStart

          if (meta.data.length < sourceEnd) {
            // we need to write to another DAGNode so increment the streamStart
            // by the number of bytes from buffer we've written
            streamStart += meta.data.length
          }

          const newData = Buffer.from(meta.data)
          newContent.copy(newData, targetStart, sourceStart, sourceEnd)

          const nodeData = new UnixFs(meta.type, newData).marshal()

          waterfall([
            // Create a DAGNode with the new data
            (cb) => DAGNode.create(nodeData, cb),
            (newNode, cb) => {
              // Persist it
              ipfs.dag.put(newNode, {
                cid: new CID(newNode.multihash)
              }, (error) => cb(error, newNode))
            },
            (newNode, cb) => {
              log(`Created DAGNode with new data with hash ${bs58.encode(newNode.multihash)}`)

              // Store the CID and friends so we can update it's parent's links
              cb(null, {
                parent: parent,
                index: index,
                multihash: newNode.multihash,
                size: newNode.size
              })
            }
          ], next)
        }
      ], done)
    }
  }
}

module.exports = updateNode
