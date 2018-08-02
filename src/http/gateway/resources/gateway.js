'use strict'

const debug = require('debug')
const log = debug('jsipfs:http-gateway')
log.error = debug('jsipfs:http-gateway:error')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const fileType = require('file-type')
const mime = require('mime-types')
const Stream = require('readable-stream')

const { resolver } = require('ipfs-http-response')
const PathUtils = require('../utils/path')

function detectContentType (ref, chunk) {
  let fileSignature

  // try to guess the filetype based on the first bytes
  // note that `file-type` doesn't support svgs, therefore we assume it's a svg if ref looks like it
  if (!ref.endsWith('.svg')) {
    fileSignature = fileType(chunk)
  }

  // if we were unable to, fallback to the `ref` which might contain the extension
  const mimeType = mime.lookup(fileSignature ? fileSignature.ext : ref)

  return mime.contentType(mimeType)
}

module.exports = {
  checkCID: (request, reply) => {
    if (!request.params.cid) {
      return reply({
        Message: 'Path Resolve error: path must contain at least one component',
        Code: 0,
        Type: 'error'
      }).code(400).takeover()
    }

    return reply({
      ref: `/ipfs/${request.params.cid}`
    })
  },
  handler: (request, reply) => {
    const ref = request.pre.args.ref
    const ipfs = request.server.app.ipfs

    function handleGatewayResolverError (err) {
      if (err) {
        log.error('err: ', err.toString(), ' fileName: ', err.fileName)

        const errorToString = err.toString()
        // switch case with true feels so wrong.
        switch (true) {
          case (errorToString === 'Error: This dag node is a directory'):
            resolver.directory(ipfs, ref, err.fileName, (err, data) => {
              if (err) {
                log.error(err)
                return reply(err.toString()).code(500)
              }
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
            })
            break
          case (errorToString.startsWith('Error: no link named')):
            return reply(errorToString).code(404)
          case (errorToString.startsWith('Error: multihash length inconsistent')):
          case (errorToString.startsWith('Error: Non-base58 character')):
            return reply({ Message: errorToString, Code: 0, Type: 'error' }).code(400)
          default:
            log.error(err)
            return reply({ Message: errorToString, Code: 0, Type: 'error' }).code(500)
        }
      }
    }

    return resolver.multihash(ipfs, ref, (err, data) => {
      if (err) {
        return handleGatewayResolverError(err)
      }

      const stream = ipfs.files.catReadableStream(data.multihash)
      stream.once('error', (err) => {
        if (err) {
          log.error(err)
          return reply(err.toString()).code(500)
        }
      })

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
        let contentTypeDetected = false
        let stream2 = new Stream.PassThrough({ highWaterMark: 1 })
        stream2.on('error', (err) => {
          log.error('stream2 err: ', err)
        })

        let response = reply(stream2).hold()

        pull(
          toPull.source(stream),
          pull.through((chunk) => {
            // Guess content-type (only once)
            if (chunk.length > 0 && !contentTypeDetected) {
              let contentType = detectContentType(ref, chunk)
              contentTypeDetected = true

              log('ref ', ref)
              log('mime-type ', contentType)

              if (contentType) {
                log('writing content-type header')
                response.header('Content-Type', contentType)
              }

              response.send()
            }

            stream2.write(chunk)
          }),
          pull.onEnd(() => {
            log('stream ended.')
            stream2.end()
          })
        )
      }
    })
  }
}
