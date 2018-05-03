'use strict'

const UnixFs = require('ipfs-unixfs')
const {
  unmarshal
} = UnixFs
const pull = require('pull-stream/pull')
const cat = require('pull-cat')
const collect = require('pull-stream/sinks/collect')
const pushable = require('pull-pushable')
const map = require('pull-stream/throughs/map')
const filter = require('pull-stream/throughs/filter')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const {
  DAGLink
} = require('ipld-dag-pb')
const log = require('debug')('mfs:write:update-node')
const {
  limitStreamBytes,
  createNode,
  zeros,
  loadNode,
  MAX_CHUNK_SIZE
} = require('../utils')
const importNode = require('./import-node')
const updateNodeBytes = require('./update-tree')
const truncateNode = require('./truncate-node')

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
      const meta = unmarshal(node.data)
      const fileSize = meta.fileSize()

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
            (cb) => updateNodeBytes(ipfs, node, fileSize, streamStart, streamEnd, updateSource, options, cb),

            // setup pull stream for appending bytes
            (cb) => importNode(ipfs, appendSource, options, cb)
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
                const link1 = new DAGLink('', updatedNode.data.length, updatedNode.multihash)
                const link2 = new DAGLink('', appendedNode.data.length, appendedNode.multihash)

                const newMeta = new UnixFs(updatedMeta.type)
                newMeta.addBlockSize(updatedMeta.fileSize())
                newMeta.addBlockSize(appendedMeta.fileSize())

                log('created one new node from two small nodes')
                return createNode(ipfs, newMeta.marshal(), [link1, link2], options, next)
              }
            }

            // if we added new bytes, add them to the root node of the original file
            // this is consistent with the go implementation but probably not the right thing to do

            // update UnixFs metadata on the root node
            updatedMeta.addBlockSize(appendedMeta.fileSize())

            return createNode(ipfs, updatedMeta.marshal(), updatedNode.links.concat(
              new DAGLink('', appendedNode.data.length, appendedNode.multihash)
            ), options, next)
          }

          next(null, updatedNode)
        },
        (updatedNode, cb) => {
          if (options.truncate) {
            return truncateNode(ipfs, updatedNode, streamEnd, options, cb)
          }

          cb(null, updatedNode)
        }
      ], done)
    }
  ], callback)
}

module.exports = updateNode
