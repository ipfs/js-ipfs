'use strict'

const UnixFs = require('ipfs-unixfs')
const {
  unmarshal
} = UnixFs
const pull = require('pull-stream/pull')
const cat = require('pull-cat')
const values = require('pull-stream/sources/values')
const collect = require('pull-stream/sinks/collect')
const pushable = require('pull-pushable')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const filter = require('pull-stream/throughs/filter')
const paramap = require('pull-paramap')
const {
  leafFirst
} = require('pull-traverse')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const findFileSize = require('./find-file-size')
const {
  DAGNode,
  DAGLink
} = require('ipld-dag-pb')
const log = require('debug')('mfs:write:update-node')
const bs58 = require('bs58')
const {
  limitStreamBytes,
  addLink,
  createNode,
  zeros,
  loadNode,
  MAX_CHUNK_SIZE
} = require('../utils')
const importer = require('ipfs-unixfs-engine').importer

const updateNode = (ipfs, cidToUpdate, source, options, callback) => {
  let offset = options.offset || 0

  // Where we want to start writing in the stream
  let streamStart = offset

  // Where we want to stop writing in the stream
  const streamEnd = offset + options.length

  // Where we currently are in the file
  let destinationStreamPosition = streamStart

  waterfall([
    (done) => loadNode(ipfs, cidToUpdate, done),
    (node, done) => {
      const fileSize = findFileSize(node)

      log(`Updating bytes ${streamStart}-${streamEnd} of ${fileSize} bytes from ${cidToUpdate.toBaseEncodedString()} with source`)

      // We are going to replace bytes in existing leaf nodes and rewrite
      // their CIDs and the CIDs of the parent nodes

      // if we start writing past the end of the file we'll need to pad it with zeros,
      // remember how many zeros we need to let us still write the correct number of
      // bytes when --count has been specified
      let paddingBytesLength = 0

      if (streamStart > fileSize) {
        // we will start writing past the end of the file, pad the gap with empty bytes
        paddingBytesLength = streamStart - fileSize

        log(`Adding ${paddingBytesLength} 0s to the start of the block`)

        source = cat([
          zeros(paddingBytesLength),
          source
        ])
      }

      // create two pushable streams, one for updating existing DAGNode data
      // and one for creating new DAGNodes
      const updateSource = pushable()
      const appendSource = pushable()

      // receive bytes from source
      pull(
        source,
        filter(Boolean),
        limitStreamBytes(options.length + paddingBytesLength),
        map((buffer) => {
          log(`Writing ${buffer.length} at ${destinationStreamPosition} of ${fileSize}`)

          // write to either the updating stream or appending stream depending on
          // where we are in the stream
          if (destinationStreamPosition < fileSize) {
            if (destinationStreamPosition + buffer.length > fileSize) {
              // this buffer starts inside the file but ends outside of it.
              // split the buffer into two pieces, update one and append the other
              updateSource.push(buffer.slice(0, fileSize - destinationStreamPosition))
              appendSource.push(buffer.slice(fileSize - destinationStreamPosition))
            } else {
              // this buffer starts and ends inside the file
              updateSource.push(buffer)
            }
          } else {
            // this buffer starts outside the file
            appendSource.push(buffer)
          }

          // the next buffer will start after this one has finished
          destinationStreamPosition += buffer.length
        }),
        collect((error) => {
          updateSource.end(error)
          appendSource.end()
        })
      )

      waterfall([
        (next) => {
          // wait for both streams to end
          parallel([
            // set up pull stream for replacing bytes
            (cb) => updateNodeBytes(node, fileSize, updateSource, cb),

            // setup pull stream for appending bytes
            (cb) => appendNodeBytes(appendSource, cb)
          ], next)
        },
        ([updatedNode, appendedNode], next) => {
          updatedNode = updatedNode || node

          const updatedMeta = unmarshal(updatedNode.data)
          const appendedMeta = unmarshal(appendedNode.data)

          if (appendedMeta.fileSize()) {
            // both nodes are small
            if (!updatedNode.links.length && !appendedNode.links.length) {
              const totalDataLength = updatedMeta.data.length + appendedMeta.data.length

              if (totalDataLength < MAX_CHUNK_SIZE) {
                // Our data should fit into one DAGNode so merge the data from both nodes..
                const newMeta = new UnixFs(updatedMeta.type, Buffer.concat([updatedMeta.data, appendedMeta.data]))

                log('combined two nodes')
                return createNode(ipfs, newMeta.marshal(), [], options, next)
              } else {
                // We expanded one DAGNode into two so create a tree
                const link1 = new DAGLink('', updatedMeta.fileSize(), updatedNode.multihash)
                const link2 = new DAGLink('', appendedMeta.fileSize(), appendedNode.multihash)

                const newMeta = new UnixFs(updatedMeta.type)
                newMeta.addBlockSize(updatedMeta.fileSize())
                newMeta.addBlockSize(appendedMeta.fileSize())

                log('created one new node from two small nodes')
                return createNode(ipfs, newMeta.marshal(), [link1, link2], options, next)
              }
            }

            // if we added new bytes, add them to the root node of the original file
            // this is consistent with the go implementation but probably broken

            // update UnixFs metadata on the root node
            updatedMeta.addBlockSize(appendedMeta.fileSize())

            return waterfall([
              (cb) => DAGNode.create(updatedMeta.marshal(), updatedNode.links, cb),
              (newNode, cb) => addLink(ipfs, {
                parent: newNode,
                child: appendedNode
              }, cb)
            ], next)
          }

          next(null, updatedNode)
        }
      ], done)
    }
  ], callback)

  function appendNodeBytes (source, callback) {
    waterfall([
      (cb) => pull(
        values([{
          content: pull(source)
        }]),
        importer(ipfs._ipld, {
          progress: options.progress,
          hashAlg: options.hash,
          cidVersion: options.cidVersion,
          strategy: options.strategy
        }),
        collect(cb)
      ),
      (results, cb) => loadNode(ipfs, results[0], cb)
    ], callback)
  }

  function updateNodeBytes (node, fileSize, source, callback) {
    waterfall([
      (cb) => pull(
        source,
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

              log(`Updated root is ${bs58.encode(updatedRoot.multihash)}`)

              done(error, updatedRoot)
            })
          )
        }),
        collect((error, results) => cb(error, results && results[0]))
      ),
      (updatedNodeCID, cb) => loadNode(ipfs, updatedNodeCID, cb)
    ], callback)
  }

  // Where we currently are in the existing file
  let streamPosition = 0

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
        loadNode(ipfs, child.link, (error, node) => {
          cb(error, Object.assign({}, child, {
            node
          }))
        })
      })
    )
  }

  function updateNodeData (newContent) {
    return ({ parent, link, nodeStart, node, index }, done) => {
      if (!node || !node.data) {
        return done()
      }

      const meta = unmarshal(node.data)

      if (!meta || !meta.data || !meta.data.length) {
        return done()
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
        (cb) => createNode(ipfs, nodeData, [], options, cb),
        (newNode, cb) => {
          log(`Created DAGNode with new data with hash ${bs58.encode(newNode.multihash)} to replace ${bs58.encode(node.multihash)}`)

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

module.exports = updateNode
