'use strict'

const debug = require('debug')
const log = debug('ipfs:http-gateway')
log.error = debug('ipfs:http-gateway:error')

const fileType = require('file-type')
const mime = require('mime-types')
const { PassThrough } = require('readable-stream')
const Boom = require('boom')
const Ammo = require('@hapi/ammo') // HTTP Range processing utilities
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
          return h.redirect(PathUtils.joinURLParts(ref, data[0].Name))
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

    // Support If-None-Match & Etag (Conditional Requests from RFC7232)
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
    const etag = `"${data.cid}"`
    const cachedEtag = request.headers['if-none-match']
    if (cachedEtag === etag || cachedEtag === `W/${etag}`) {
      return h.response().code(304) // Not Modified
    }

    // Immutable content produces 304 Not Modified for all values of If-Modified-Since
    if (ref.startsWith('/ipfs/') && request.headers['if-modified-since']) {
      return h.response().code(304) // Not Modified
    }

    // This necessary to set correct Content-Length and validate Range requests
    // Note: we need `size` (raw data), not `cumulativeSize` (data + DAGNodes)
    const { size } = await ipfs.files.stat(`/ipfs/${data.cid}`)

    // Handle Byte Range requests (https://tools.ietf.org/html/rfc7233#section-2.1)
    const catOptions = {}
    let rangeResponse = false
    if (request.headers.range) {
      // If-Range is respected (when present), but we compare it only against Etag
      // (Last-Modified date is too weak for IPFS use cases)
      if (!request.headers['if-range'] || request.headers['if-range'] === etag) {
        const ranges = Ammo.header(request.headers.range, size)
        if (!ranges) {
          const error = Boom.rangeNotSatisfiable()
          error.output.headers['content-range'] = `bytes */${size}`
          throw error
        }

        if (ranges.length === 1) { // Ignore requests for multiple ranges (hard to map to ipfs.cat and not used in practice)
          rangeResponse = true
          const range = ranges[0]
          catOptions.offset = range.from
          catOptions.length = (range.to - range.from + 1)
        }
      }
    }

    const rawStream = ipfs.catReadableStream(data.cid, catOptions)
    const responseStream = new ResponseStream()

    // Pass-through Content-Type sniffing over initial bytes
    const { peekedStream, contentType } = await new Promise((resolve, reject) => {
      const peekBytes = fileType.minimumBytes
      peek(rawStream, peekBytes, (err, streamHead, peekedStream) => {
        if (err) {
          log.error(err)
          return reject(err)
        }
        resolve({ peekedStream, contentType: detectContentType(ref, streamHead) })
      })
    })

    peekedStream.pipe(responseStream)

    const res = h.response(responseStream).code(rangeResponse ? 206 : 200)

    // Etag maps directly to an identifier for a specific version of a resource
    // and enables smart client-side caching thanks to If-None-Match
    res.header('etag', etag)

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

    if (rangeResponse) {
      const from = catOptions.offset
      const to = catOptions.offset + catOptions.length - 1
      res.header('Content-Range', `bytes ${from}-${to}/${size}`)
      res.header('Content-Length', catOptions.length)
    } else {
      // Announce support for Range requests
      res.header('Accept-Ranges', 'bytes')
      res.header('Content-Length', size)
    }

    // Support Content-Disposition via ?filename=foo parameter
    // (useful for browser vendor to download raw CID into custom filename)
    // Source: https://github.com/ipfs/go-ipfs/blob/v0.4.20/core/corehttp/gateway_handler.go#L232-L236
    if (request.query.filename) {
      res.header('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(request.query.filename)}`)
    }

    return res
  },

  afterHandler (request, h) {
    const { response } = request
    // Add headers to successfult responses (regular or range)
    if (response.statusCode === 200 || response.statusCode === 206) {
      const { ref } = request.pre.args
      response.header('X-Ipfs-Path', ref)
      if (ref.startsWith('/ipfs/')) {
        // "set modtime to a really long time ago, since files are immutable and should stay cached"
        // Source: https://github.com/ipfs/go-ipfs/blob/v0.4.20/core/corehttp/gateway_handler.go#L228-L229
        response.header('Last-Modified', 'Thu, 01 Jan 1970 00:00:01 GMT')
        // Suborigins: https://github.com/ipfs/in-web-browsers/issues/66
        const rootCid = ref.split('/')[2]
        const ipfsOrigin = cidToString(rootCid, { base: 'base32' })
        response.header('Suborigin', 'ipfs000' + ipfsOrigin)
      }
      // TODO: we don't have case-insensitive solution for /ipns/ yet (https://github.com/ipfs/go-ipfs/issues/5287)
    }
    return h.continue
  }

}
