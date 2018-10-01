'use strict'

const {
  unmarshal
} = require('ipfs-unixfs')
const pull = require('pull-stream/pull')
const cat = require('pull-cat')
const collect = require('pull-stream/sinks/collect')
const empty = require('pull-stream/sources/empty')
const err = require('pull-stream/sources/error')
const log = require('debug')('ipfs:mfs:write')
const {
  limitStreamBytes,
  countStreamBytes,
  zeros
} = require('../utils')
const values = require('pull-stream/sources/values')
const {
  exporter,
  importer
} = require('ipfs-unixfs-engine')
const deferred = require('pull-defer')
const CID = require('cids')

const updateNode = (ipfs, existingNode, source, options, callback) => {
  let existingNodeCid
  let existingNodeMeta

  if (existingNode) {
    existingNodeCid = new CID(existingNode.multihash)
    existingNodeMeta = unmarshal(existingNode.data)
    log(`Overwriting file ${existingNodeCid.toBaseEncodedString()} offset ${options.offset} length ${options.length}`)
  } else {
    log(`Writing file offset ${options.offset} length ${options.length}`)
  }

  const sources = []

  // pad start of file if necessary
  if (options.offset > 0) {
    if (existingNode && existingNodeMeta.fileSize() > options.offset) {
      log(`Writing first ${options.offset} bytes of original file`)

      const startFile = deferred.source()

      sources.push(startFile)

      pull(
        exporter(existingNodeCid, ipfs.dag, {
          offset: 0,
          length: options.offset
        }),
        collect((error, files) => {
          if (error) {
            return startFile.resolve(err(error))
          }

          startFile.resolve(files[0].content)
        })
      )
    } else {
      log(`Writing zeros for first ${options.offset} bytes`)
      sources.push(zeros(options.offset))
    }
  }

  const endFile = deferred.source()

  // add the new source
  sources.push(
    pull(
      source,
      limitStreamBytes(options.length),
      countStreamBytes((bytesRead) => {
        log(`Wrote ${bytesRead} bytes`)

        if (existingNode && !options.truncate) {
          // if we've done reading from the new source and we are not going
          // to truncate the file, add the end of the existing file to the output
          const fileSize = existingNodeMeta.fileSize()
          const offset = options.offset + bytesRead

          if (fileSize > offset) {
            log(`Writing last ${fileSize - offset} of ${fileSize} bytes from original file`)
            pull(
              exporter(existingNodeCid, ipfs.dag, {
                offset
              }),
              collect((error, files) => {
                if (error) {
                  return endFile.resolve(err(error))
                }

                endFile.resolve(files[0].content)
              })
            )
          } else {
            log(`Not writing last bytes from original file`)
            endFile.resolve(empty())
          }
        }
      })
    )
  )

  // add the end of the file if necessary
  if (existingNode && !options.truncate) {
    sources.push(
      endFile
    )
  }

  pull(
    values([{
      path: '',
      content: cat(sources)
    }]),
    importer(ipfs.dag, {
      progress: options.progress,
      hashAlg: options.hash,
      cidVersion: options.cidVersion,
      strategy: options.strategy,
      rawLeaves: options.rawLeaves,
      reduceSingleLeafToSelf: options.reduceSingleLeafToSelf,
      leafType: options.leafType
    }),
    collect((error, results) => {
      if (error) {
        return callback(error)
      }

      const result = results.pop()

      log(`Wrote ${new CID(result.multihash).toBaseEncodedString()}`)

      callback(null, result)
    })
  )
}

module.exports = updateNode
