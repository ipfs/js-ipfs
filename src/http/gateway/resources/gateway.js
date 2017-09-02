'use strict'

const debug = require('debug')
const log = debug('jsipfs:http-gateway')
log.error = debug('jsipfs:http-gateway:error')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const fileType = require('file-type')
const mime = require('mime-types')
const GatewayResolver = require('../resolver')
const PathUtils = require('../utils/path')
const Stream = require('stream')

module.exports = {
  checkHash: (request, reply) => {
    if (!request.params.hash) {
      return reply({
        Message: 'Path Resolve error: path must contain at least one component',
        Code: 0
      }).code(400).takeover()
    }

    return reply({
      ref: `/ipfs/${request.params.hash}`
    })
  },
  handler: (request, reply) => {
    const ref = request.pre.args.ref
    const ipfs = request.server.app.ipfs

    return GatewayResolver
           .resolveMultihash(ipfs, ref)
           .then((data) => {
             ipfs
             .files
             .cat(data.multihash)
             .then((stream) => {
               if (ref.endsWith('/')) {
                  // remove trailing slash for files
                 return reply
                        .redirect(PathUtils.removeTrailingSlash(ref))
                        .permanent(true)
               } else {
                 if (!stream._read) {
                   stream._read = () => {}
                   stream._readableState = {}
                 }
                 //  response.continue()
                 let filetypeChecked = false
                 let stream2 = new Stream.PassThrough({highWaterMark: 1})
                 let response = reply(stream2).hold()

                 pull(
                   toPull.source(stream),
                   pull.drain((chunk) => {
                     // Check file type.  do this once.
                     if (chunk.length > 0 && !filetypeChecked) {
                       log('got first chunk')
                       let fileSignature = fileType(chunk)
                       log('file type: ', fileSignature)

                       filetypeChecked = true
                       const mimeType = mime.lookup((fileSignature) ? fileSignature.ext : null)
                       log('ref ', ref)
                       log('mime-type ', mimeType)

                       if (mimeType) {
                         log('writing mimeType')

                         response
                           .header('Content-Type', mime.contentType(mimeType))
                           .header('Access-Control-Allow-Headers', 'X-Stream-Output, X-Chunked-Ouput')
                           .header('Access-Control-Allow-Methods', 'GET')
                           .header('Access-Control-Allow-Origin', '*')
                           .header('Access-Control-Expose-Headers', 'X-Stream-Output, X-Chunked-Ouput')
                           .send()
                       } else {
                         response
                          .header('Access-Control-Allow-Headers', 'X-Stream-Output, X-Chunked-Ouput')
                          .header('Access-Control-Allow-Methods', 'GET')
                          .header('Access-Control-Allow-Origin', '*')
                          .header('Access-Control-Expose-Headers', 'X-Stream-Output, X-Chunked-Ouput')
                          .send()
                       }
                     }

                     stream2.write(chunk)
                   }, (err) => {
                     if (err) throw err
                     log('stream ended.')
                     stream2.end()
                   })
                 )
               }
             })
             .catch((err) => {
               if (err) {
                 log.error(err)
                 return reply(err.toString()).code(500)
               }
             })
           }).catch((err) => {
             log('err: ', err.toString(), ' fileName: ', err.fileName)

             const errorToString = err.toString()
             if (errorToString === 'Error: This dag node is a directory') {
               return GatewayResolver
                      .resolveDirectory(ipfs, ref, err.fileName)
                      .then((data) => {
                        if (typeof data === 'string') {
                          // no index file found
                          if (!ref.endsWith('/')) {
                            // for a directory, if URL doesn't end with a /
                            // append / and redirect permanent to that URL
                            return reply.redirect(`${ref}/`).permanent(true)
                          } else {
                            // send directory listing
                            return reply(data)
                          }
                        } else {
                          // found index file
                          // redirect to URL/<found-index-file>
                          return reply.redirect(PathUtils.joinURLParts(ref, data[0].name))
                        }
                      }).catch((err) => {
                        log.error(err)
                        return reply(err.toString()).code(500)
                      })
             } else if (errorToString.startsWith('Error: no link named')) {
               return reply(errorToString).code(404)
             } else if (errorToString.startsWith('Error: multihash length inconsistent') ||
                       errorToString.startsWith('Error: Non-base58 character')) {
               return reply({Message: errorToString, code: 0}).code(400)
             } else {
               log.error(err)
               return reply({Message: errorToString, code: 0}).code(500)
             }
           })
  }
}
