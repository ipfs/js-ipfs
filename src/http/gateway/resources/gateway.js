'use strict'

const debug = require('debug')
const log = debug('ipfs:http-gateway')
log.error = debug('ipfs:http-gateway:error')

const fileType = require('file-type')
const mime = require('mime-types')
const { PassThrough } = require('readable-stream')
const Boom = require('boom')
const peek = require('buffer-peek-stream')

const { resolver } = require('ipfs-http-response')
const PathUtils = require('../utils/path')
const { cidToString } = require('../../../utils/cid')

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

// Enable streaming of compressed payload
// https://github.com/hapijs/hapi/issues/3599
class ResponseStream extends PassThrough {
  _read (size) {
    super._read(size)
    if (this._compressor) {
      this._compressor.flush()
    }
  }
  setCompressor (compressor) {
    this._compressor = compressor
  }
}

module.exports = {
  checkCID (request, h) {
    if (!request.params.cid) {
      throw Boom.badRequest('Path Resolve error: path must contain at least one component')
    }

    return { ref: `/ipfs/${request.params.cid}` }
  },

  async handler (request, h) {
    const { ref } = request.pre.args
    const { ipfs } = request.server.app

    let data
    try {
      data = await resolver.cid(ipfs, ref)
    } catch (err) {
      const errorToString = err.toString()
      log.error('err: ', errorToString, ' fileName: ', err.fileName)

      // switch case with true feels so wrong.
      switch (true) {
        case (errorToString === 'Error: This dag node is a directory'):
          data = await resolver.directory(ipfs, ref, err.cid)

          if (typeof data === 'string') {
            // no index file found
            if (!ref.endsWith('/')) {
              // for a directory, if URL doesn't end with a /
              // append / and redirect permanent to that URL
              return h.redirect(`${ref}/`).permanent(true)
            }
            // send directory listing
            return h.response(data)
          }

          // found index file
          // redirect to URL/<found-index-file>
          return h.redirect(PathUtils.joinURLParts(ref, data[0].name))
        case (errorToString.startsWith('Error: no link named')):
          throw Boom.boomify(err, { statusCode: 404 })
        case (errorToString.startsWith('Error: multihash length inconsistent')):
        case (errorToString.startsWith('Error: Non-base58 character')):
          throw Boom.boomify(err, { statusCode: 400 })
        default:
          log.error(err)
          throw err
      }
    }

    if (ref.endsWith('/')) {
      // remove trailing slash for files
      return h.redirect(PathUtils.removeTrailingSlash(ref)).permanent(true)
    }

    const rawStream = ipfs.catReadableStream(data.cid)
    const responseStream = new ResponseStream()

    // Pass-through Content-Type sniffing over initial bytes
    const contentType = await new Promise((resolve, reject) => {
      try {
        const peekBytes = fileType.minimumBytes
        peek(rawStream, peekBytes, (err, streamHead, outputStream) => {
          if (err) {
            log.error(err)
            return reject(err)
          }
          outputStream.pipe(responseStream)
          resolve(detectContentType(ref, streamHead))
        })
      } catch (err) {
        log.error(err)
        reject(err)
      }
    })

    const res = h.response(responseStream)

    // Etag maps directly to an identifier for a specific version of a resource
    res.header('Etag', `"${data.cid}"`)

    // Set headers specific to the immutable namespace
    if (ref.startsWith('/ipfs/')) {
      res.header('Cache-Control', 'public, max-age=29030400, immutable')
    }

    log('ref ', ref)
    log('content-type ', contentType)

    if (contentType) {
      log('writing content-type header')
      res.header('Content-Type', contentType)
    }

    return res
  },

  afterHandler (request, h) {
    const { response } = request
    if (response.statusCode === 200) {
      const { ref } = request.pre.args
      response.header('X-Ipfs-Path', ref)
      if (ref.startsWith('/ipfs/')) {
        const rootCid = ref.split('/')[2]
        const ipfsOrigin = cidToString(rootCid, { base: 'base32' })
        response.header('Suborigin', 'ipfs000' + ipfsOrigin)
      }
      // TODO: we don't have case-insensitive solution for /ipns/ yet (https://github.com/ipfs/go-ipfs/issues/5287)
    }
    return h.continue
  }

}
