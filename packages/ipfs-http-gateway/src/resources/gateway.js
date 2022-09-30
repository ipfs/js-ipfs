import { logger } from '@libp2p/logger'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import Boom from '@hapi/boom'
import Ammo from '@hapi/ammo'
import last from 'it-last'
import { CID } from 'multiformats/cid'
import { base32 } from 'multiformats/bases/base32'
import { resolver, utils } from 'ipfs-http-response'
import * as isIPFS from 'is-ipfs'
// @ts-expect-error no types
import toStream from 'it-to-stream'
import * as PathUtils from '../utils/path.js'

const { detectContentType } = utils

const log = logger('ipfs:http-gateway')

export const Gateway = {

  /**
   * @param {import('../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const { ipfs } = request.server.app
    const path = request.path

    let ipfsPath = path

    if (path.startsWith('/ipns/')) {
      ipfsPath = await last(ipfs.name.resolve(path, { recursive: true })) || path
    }

    // The resolver from ipfs-http-response supports only immutable /ipfs/ for now,
    // so we convert /ipns/ to /ipfs/ before passing it to the resolver ¯\_(ツ)_/¯
    // This could be removed if a solution proposed in
    //  https://github.com/ipfs/js-ipfs-http-response/issues/22 lands upstream
    ipfsPath = decodeURI(ipfsPath)

    let directory = false
    let data
    try {
      data = await resolver.cid(ipfs, ipfsPath)
    } catch (/** @type {any} */ err) {
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
        case (errorToString.startsWith('Error: invalid character')):
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
    if (request.headers['service-worker'] === 'script') {
      // Disallow Service Worker registration on /ipfs scope
      // https://github.com/ipfs/go-ipfs/issues/4025
      if (path.match(/^\/ip[nf]s\/[^/]+$/)) throw Boom.badRequest('navigator.serviceWorker: registration is not allowed for this scope')
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

    const { source, contentType } = await detectContentType(ipfsPath, ipfs.cat(data.cid, catOptions))
    const responseStream = toStream.readable(source)

    const res = h.response(responseStream).code(rangeResponse ? 206 : 200)

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
      res.header('Content-Length', `${catOptions.length}`)
    } else {
      // Announce support for Range requests
      res.header('Accept-Ranges', 'bytes')
      res.header('Content-Length', `${size}`)
    }

    // Support Content-Disposition via ?filename=foo parameter
    // (useful for browser vendor to download raw CID into custom filename)
    // Source: https://github.com/ipfs/go-ipfs/blob/v0.4.20/core/corehttp/gateway_handler.go#L232-L236
    if (request.query.filename) {
      res.header('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(request.query.filename)}`)
    }

    return res
  },

  /**
   * @param {import('../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  afterHandler (request, h) {
    const { response } = request

    if (Boom.isBoom(response)) {
      return h.continue
    }

    // Add headers to successful responses (regular or range)
    if (response.statusCode === 200 || response.statusCode === 206) {
      const path = request.path
      response.header('X-Ipfs-Path', path)
      if (path.startsWith('/ipfs/')) {
        // "set modtime to a really long time ago, since files are immutable and should stay cached"
        // Source: https://github.com/ipfs/go-ipfs/blob/v0.4.20/core/corehttp/gateway_handler.go#L228-L229
        response.header('Last-Modified', 'Thu, 01 Jan 1970 00:00:01 GMT')
        // Suborigin for /ipfs/: https://github.com/ipfs/in-web-browsers/issues/66
        const rootCid = path.split('/')[2]
        const ipfsOrigin = CID.parse(rootCid).toV1().toString(base32)
        response.header('Suborigin', `ipfs000${ipfsOrigin}`)
      } else if (path.startsWith('/ipns/')) {
        // Suborigin for /ipns/: https://github.com/ipfs/in-web-browsers/issues/66
        const root = path.split('/')[2]
        // encode CID/FQDN in base32 (Suborigin allows only a-z)
        const ipnsOrigin = isIPFS.cid(root)
          ? CID.parse(root).toV1().toString(base32)
          : base32.encode(uint8ArrayFromString(root))
        response.header('Suborigin', `ipns000${ipnsOrigin}`)
      }
    }
    return h.continue
  }
}
