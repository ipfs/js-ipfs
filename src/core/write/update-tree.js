'use strict'

const waterfall = require('async/waterfall')
const pull = require('pull-stream/pull')
const values = require('pull-stream/sources/values')
const asyncMap = require('pull-stream/throughs/async-map')
const filter = require('pull-stream/throughs/filter')
const collect = require('pull-stream/sinks/collect')
const paramap = require('pull-paramap')
const log = require('debug')('ipfs:mfs:write:update-tree')
const UnixFs = require('ipfs-unixfs')
const CID = require('cids')
const {
  unmarshal
} = UnixFs
const {
  leafFirst
} = require('pull-traverse')
const {
  DAGLink
} = require('ipld-dag-pb')
const {
  createNode,
  loadNode,
  bufferPullStreamSource
} = require('../utils')

const updateTree = (ipfs, root, fileSize, streamStart, streamEnd, source, options, callback) => {
  // Where we currently are in the existing file
  let streamPosition = 0

  // Find the DAGNodes that contain the data at the specified offset/length
  // Merge the data and create new DAGNodes with the merged data
  // Keep a record of the new CIDs and update the tree
  waterfall([
    (cb) => pull(
      leafFirst({
        parent: null,
        link: null,
        index: null,
        node: root,
        nodeStart: streamPosition,
        nodeEnd: fileSize
      }, findDAGNodesWithRequestedData),
      asyncMap(updateNodeData(source)),
      filter(Boolean),
      asyncMap((link, next) => {
        if (!link.parent || link.index === undefined) {
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
          (cb) => createNode(ipfs, link.parent.node.data, links, options, cb),
          (newNode, cb) => {
            link.parent.node = newNode

            cb(null, link)
          }
        ], next)
      }),
      collect((error, results) => {
        let updatedRoot

        if (!error && results && results.length) {
          updatedRoot = results[0]

          while (updatedRoot.parent) {
            updatedRoot = updatedRoot.parent
          }

          if (updatedRoot.node) {
            updatedRoot = updatedRoot.node
          }

          log(`Updated root is ${new CID(updatedRoot.multihash).toBaseEncodedString()}`)
        }

        cb(error, updatedRoot)
      })
    ),
    (updatedNodeCID, cb) => loadNode(ipfs, updatedNodeCID, cb)
  ], callback)

  // Returns a pull stream that will load the data from the children of the passed node
  function findDAGNodesWithRequestedData ({ node }) {
    const meta = unmarshal(node.data)

    log(`Node links ${node.links.length}${meta.blockSizes.length ? `, block sizes ${meta.blockSizes.join(', ')}` : ''} with ${meta.data ? `${meta.data.length} bytes of` : 'no'} data`)

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
        loadNode(ipfs, child.link, (error, node) => {
          cb(error, Object.assign({}, child, {
            node
          }))
        })
      })
    )
  }

  function updateNodeData (source) {
    const read = bufferPullStreamSource(source)

    return ({ parent, link, nodeStart, node, index }, done) => {
      if (!node || !node.data) {
        return done()
      }

      const meta = unmarshal(node.data)

      if (!meta || !meta.data || !meta.data.length) {
        return done()
      }

      waterfall([
        (cb) => read(meta.data.length, cb),
        (sourceData, cb) => {
          const targetStart = streamStart - nodeStart
          const sourceStart = 0
          let sourceEnd = streamEnd - streamStart

          if (meta.data.length < sourceEnd) {
            // we need to write to another DAGNode so increment the streamStart
            // by the number of bytes from buffer we've written
            streamStart += meta.data.length
          }

          const newData = Buffer.from(meta.data)

          if (sourceEnd === Infinity) {
            sourceEnd = undefined
          }

          try {
            sourceData.copy(newData, targetStart, sourceStart, sourceEnd)
          } catch (error) {
            return cb(error)
          }

          cb(null, new UnixFs(meta.type, newData).marshal())
        },
        // Create a DAGNode with the new data
        (nodeData, cb) => createNode(ipfs, nodeData, [], options, cb),
        (newNode, cb) => {
          // Store the CID and friends so we can update it's parent's links
          cb(null, {
            parent: parent,
            index: index,
            multihash: newNode.multihash,
            size: newNode.size
          })
        }
      ], done)
    }
  }
}

module.exports = updateTree
