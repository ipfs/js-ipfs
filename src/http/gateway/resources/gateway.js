'use strict'

const debug = require('debug')
const log = debug('ipfs:http-gateway')
log.error = debug('ipfs:http-gateway:error')

const fileType = require('file-type')
const mime = require('mime-types')
const Boom = require('@hapi/boom')
const Ammo = require('@hapi/ammo') // HTTP Range processing utilities
const peek = require('buffer-peek-stream')

const multibase = require('multibase')
const { resolver } = require('ipfs-http-response')
const PathUtils = require('../utils/path')
const { cidToString } = require('../../../utils/cid')
const isIPFS = require('is-ipfs')

function detectContentType (path, chunk) {
  let fileSignature

  // try to guess the filetype based on the first bytes
  // note that `file-type` doesn't support svgs, therefore we assume it's a svg if ref looks like it
  if (!path.endsWith('.svg')) {
    fileSignature = fileType(chunk)
  }

  // if we were unable to, fallback to the path which might contain the extension
  const mimeType = mime.lookup(fileSignature ? fileSignature.ext : path)

  return mime.contentType(mimeType)
}

module.exports = {

  async handler (request, h) {
    const { ipfs } = request.server.app
    const path = request.path

    // The resolver from ipfs-http-response supports only immutable /ipfs/ for now,
    // so we convert /ipns/ to /ipfs/ before passing it to the resolver ¯\_(ツ)_/¯
    // This could be removed if a solution proposed in
    //  https://github.com/ipfs/js-ipfs-http-response/issues/22 lands upstream
    let ipfsPath = decodeURI(path.startsWith('/ipns/')
      ? await ipfs.name.resolve(path, { recursive: true })
      : path)

    let directory = false
    let data
    try {
      data = await resolver.cid(ipfs, ipfsPath)
    } catch (err) {
      const errorToString = err.toString()
      log.error('err: ', errorToString, ' fileName: ', err.fileName)

      // switch case with true feels so wrong.
      switch (true) {
        case (errorToString === 'Error: This dag node is a directory'):
          directory = true
          data = await resolver.directory(ipfs, ipfsPath, err.cid)

          if (typeof data === 'string') {
            // no index file found
            if (!path.endsWith('/')) {
              // add trailing slash for directory listings
              return h.redirect(`${path}/`).permanent(true)
            }
            // send directory listing
            return h.response(data)
          }

          // found index file: return <ipfsPath>/<found-index-file>
          ipfsPath = PathUtils.joinURLParts(ipfsPath, data[0].Name)
          data = await resolver.cid(ipfs, ipfsPath)
          break
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

    if (!directory && path.endsWith('/')) {
      // remove trailing slash for files
      return h.redirect(PathUtils.removeTrailingSlash(path)).permanent(true)
    }
    if (directory && !path.endsWith('/')) {
      // add trailing slash for directories with implicit index.html
      return h.redirect(`${path}/`).permanent(true)
    }

    // Support If-None-Match & Etag (Conditional Requests from RFC7232)
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
    const etag = `"${data.cid}"`
    const cachedEtag = request.headers['if-none-match']
    if (cachedEtag === etag || cachedEtag === `W/${etag}`) {
      return h.response().code(304) // Not Modified
    }

    // Immutable content produces 304 Not Modified for all values of If-Modified-Since
    if (path.startsWith('/ipfs/') && request.headers['if-modified-since']) {
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

    // Pass-through Content-Type sniffing over initial bytes
    const { peekedStream, contentType } = await new Promise((resolve, reject) => {
      const peekBytes = fileType.minimumBytes
      peek(rawStream, peekBytes, (err, streamHead, peekedStream) => {
        if (err) {
          log.error(err)
          return reject(err)
        }
        resolve({ peekedStream, contentType: detectContentType(ipfsPath, streamHead) })
      })
    })

    const res = h.response(peekedStream).code(rangeResponse ? 206 : 200)

    // Etag maps directly to an identifier for a specific version of a resource
    // and enables smart client-side caching thanks to If-None-Match
    res.header('etag', etag)

    // Set headers specific to the immutable namespace
    if (path.startsWith('/ipfs/')) {
      res.header('Cache-Control', 'public, max-age=29030400, immutable')
    }

    log('HTTP path ', path)
    log('IPFS path ', ipfsPath)
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
      const path = request.path
      response.header('X-Ipfs-Path', path)
      if (path.startsWith('/ipfs/')) {
        // "set modtime to a really long time ago, since files are immutable and should stay cached"
        // Source: https://github.com/ipfs/go-ipfs/blob/v0.4.20/core/corehttp/gateway_handler.go#L228-L229
        response.header('Last-Modified', 'Thu, 01 Jan 1970 00:00:01 GMT')
        // Suborigin for /ipfs/: https://github.com/ipfs/in-web-browsers/issues/66
        const rootCid = path.split('/')[2]
        const ipfsOrigin = cidToString(rootCid, { base: 'base32' })
        response.header('Suborigin', `ipfs000${ipfsOrigin}`)
      } else if (path.startsWith('/ipns/')) {
        // Suborigin for /ipns/: https://github.com/ipfs/in-web-browsers/issues/66
        const root = path.split('/')[2]
        // encode CID/FQDN in base32 (Suborigin allows only a-z)
        const ipnsOrigin = isIPFS.cid(root)
          ? cidToString(root, { base: 'base32' })
          : multibase.encode('base32', Buffer.from(root)).toString()
        response.header('Suborigin', `ipns000${ipnsOrigin}`)
      }
    }
    return h.continue
  }

}
