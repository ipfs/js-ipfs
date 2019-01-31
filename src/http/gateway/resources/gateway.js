'use strict'

const debug = require('debug')
const log = debug('jsipfs:http-gateway')
log.error = debug('jsipfs:http-gateway:error')
const pull = require('pull-stream')
const pushable = require('pull-pushable')
const toStream = require('pull-stream-to-stream')
const fileType = require('file-type')
const mime = require('mime-types')
const { PassThrough } = require('readable-stream')

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

module.exports = {
  checkCID (request, h) {
    if (!request.params.cid) {
      return h.response({
        Message: 'Path Resolve error: path must contain at least one component',
        Code: 0,
        Type: 'error'
      }).code(400).takeover()
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
          try {
            data = await resolver.directory(ipfs, ref, err.cid)
          } catch (err) {
            log.error(err)
            return h.response(err.toString()).code(500)
          }

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
          return h.response(errorToString).code(404)
        case (errorToString.startsWith('Error: multihash length inconsistent')):
        case (errorToString.startsWith('Error: Non-base58 character')):
          return h.response({ Message: errorToString, Code: 0, Type: 'error' }).code(400)
        default:
          log.error(err)
          return h.response({ Message: errorToString, Code: 0, Type: 'error' }).code(500)
      }
    }

    if (ref.endsWith('/')) {
      // remove trailing slash for files
      return h.redirect(PathUtils.removeTrailingSlash(ref)).permanent(true)
    }

    return new Promise((resolve, reject) => {
      let pusher
      let started = false

      pull(
        ipfs.catPullStream(data.cid),
        pull.drain(
          chunk => {
            if (!started) {
              started = true
              pusher = pushable()
              const res = h.response(toStream.source(pusher).pipe(new PassThrough()))

              // Etag maps directly to an identifier for a specific version of a resource
              res.header('Etag', `"${data.cid}"`)

              // Set headers specific to the immutable namespace
              if (ref.startsWith('/ipfs/')) {
                res.header('Cache-Control', 'public, max-age=29030400, immutable')
              }

              const contentType = detectContentType(ref, chunk)

              log('ref ', ref)
              log('mime-type ', contentType)

              if (contentType) {
                log('writing content-type header')
                res.header('Content-Type', contentType)
              }

              resolve(res)
            }
            pusher.push(chunk)
          },
          err => {
            if (err) {
              log.error(err)

              // We already started flowing, abort the stream
              if (started) {
                return pusher.end(err)
              }

              return resolve(h.response({
                Message: err.message,
                Code: 0,
                Type: 'error'
              }).code(500).takeover())
            }

            pusher.end()
          }
        )
      )
    })
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
