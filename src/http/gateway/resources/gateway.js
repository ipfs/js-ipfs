'use strict'

const debug = require('debug')
const log = debug('jsipfs:http:gateway')
log.error = debug('jsipfs:http:gateway:error')
const pull = require('pull-stream')
const fileType = require('file-type')
const mime = require('mime-types')
const Stream = require('readable-stream')
const { promisify } = require('util')

const { resolver } = require('ipfs-http-response')
const multihashResolver = promisify(resolver.multihash.bind(resolver))

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
  checkCID (request, h) {
    if (!request.params.cid) {
      return h.response({
        Message: 'Path Resolve error: path must contain at least one component',
        Code: 0,
        Type: 'error'
      }).code(400).takeover()
    }

    return {
      ref: `/ipfs/${request.params.cid}`
    }
  },
  async handler (request, h) {
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
                return h.response(err.toString()).code(500)
              }
              if (typeof data === 'string') {
                // no index file found
                if (!ref.endsWith('/')) {
                  // for a directory, if URL doesn't end with a /
                  // append / and redirect permanent to that URL
                  return h.redirect(`${ref}/`).permanent(true)
                } else {
                  // send directory listing
                  return data
                }
              } else {
                // found index file
                // redirect to URL/<found-index-file>
                return h.redirect(PathUtils.joinURLParts(ref, data[0].name))
              }
            })
            break
          case (errorToString.startsWith('Error: no link named')):
            return h.response(errorToString).code(404)
          case (errorToString.startsWith('Error: multihash length inconsistent')):
          case (errorToString.startsWith('Error: Non-base58 character')):
            return h.response({ Message: errorToString, Code: 0, Type: 'error' }).code(400)
          default:
            log.error(err)
            return h.response({ Message: errorToString, Code: 0, Type: 'error' }).code(500)
        }
      }
    }

    let data

    try {
      data = multihashResolver(ipfs, ref)
    } catch (err) {
      return handleGatewayResolverError(err)
    }

    if (ref.endsWith('/')) {
      // remove trailing slash for files
      return h.redirect(PathUtils.removeTrailingSlash(ref)).permanent(true)
    }

    return new Promise((resolve, reject) => {
      let contentTypeDetected = false
      const stream = new Stream.PassThrough({ highWaterMark: 1 })

      stream.on('error', (err) => {
        log.error('stream err: ', err)
      })

      pull(
        ipfs.files.catPullStream(data.multihash),
        pull.through((chunk) => {
          // Guess content-type (only once)
          if (chunk.length > 0 && !contentTypeDetected) {
            let contentType = detectContentType(ref, chunk)
            contentTypeDetected = true

            log('ref ', ref)
            log('mime-type ', contentType)

            if (contentType) {
              log('writing content-type header')
              stream.headers = { 'Content-Type': contentType }
            }

            resolve(stream)
          }

          stream.write(chunk)
        }),
        pull.onEnd((err) => {
          if (err) {
            if (contentTypeDetected) {
              return stream.emit('error', err)
            }
            return reject(err)
          }
          log('stream ended.')
          stream.end()
        })
      )
    })
  }
}
