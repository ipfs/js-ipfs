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
const log = require('debug')('ipfs:mfs:write:update-node')
const {
  limitStreamBytes,
  countStreamBytes,
  createNode,
  zeros,
  loadNode
} = require('../utils')
const importNode = require('./import-node')
const updateTree = require('./update-tree')
const truncateNode = require('./truncate-node')
const {
  DAGLink
} = require('ipld-dag-pb')

const updateNode = (ipfs, cidToUpdate, source, options, callback) => {
  let offset = options.offset || 0

  // Where we want to start writing in the stream
  let streamStart = offset

  // Where we want to stop writing in the stream and truncate if requested
  let streamEnd = offset + options.length

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
        countStreamBytes((count) => {
          // we normally don't know how long a stream is but if we're going to truncate the file
          // after writing we need to know how many bytes have been emitted in order to truncate
          // after the last byte so count them..
          if (streamEnd === Infinity) {
            streamEnd = offset + count
          }
        }),
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
            (cb) => updateTree(ipfs, node, fileSize, streamStart, streamEnd, updateSource, options, cb),

            // setup pull stream for appending bytes
            (cb) => importNode(ipfs, appendSource, options, cb)
          ], next)
        },
        ([updatedNode, appendedNode], next) => {
          updatedNode = updatedNode || node

          const updatedMeta = unmarshal(updatedNode.data)
          const appendedMeta = unmarshal(appendedNode.data)

          if (appendedMeta.fileSize()) {
            // add all links from appendedNode to the updatedNode
            const links = updatedNode.links

            if (appendedMeta.data && appendedMeta.data.length) {
              log('New data was found on appended node')

              if (appendedNode.links && appendedNode.links.length) {
                log('New data was also found on appended node children')
              }

              updatedMeta.addBlockSize(appendedMeta.fileSize())

              links.push(new DAGLink('', appendedNode.size, appendedNode.multihash))
            } else if (appendedNode.links && appendedNode.links.length) {
              log('New data required multiple DAGNodes')

              appendedNode.links.forEach((link, index) => {
                updatedMeta.addBlockSize(appendedMeta.blockSizes[index])
                links.push(link)
              })
            }

            // create a new node with all the links
            return createNode(ipfs, updatedMeta.marshal(), links, options, next)
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
