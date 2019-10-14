/* global Response */

'use strict'

const stream = require('stream')
const toBlob = require('stream-to-blob')

const debug = require('debug')
const log = debug('ipfs:http:response')

const resolver = require('./resolver')
const pathUtils = require('./utils/path')
const detectContentType = require('./utils/content-type')

// TODO: pass path and add Etag and X-Ipfs-Path + tests
const header = (status = 200, statusText = 'OK', headers = {}) => ({
  status,
  statusText,
  headers
})

const response = async (ipfsNode, ipfsPath) => {
  // handle hash resolve error (simple hash, test for directory now)
  const handleResolveError = async (node, path, error) => {
    if (error) {
      const errorString = error.toString()

      if (errorString.includes('dag node is a directory')) {
        try {
          const content = await resolver.directory(node, path, error.cid)
          // dir render
          if (typeof content === 'string') {
            return new Response(content, header(200, 'OK', { 'Content-Type': 'text/html' }))
          }

          // redirect to dir entry point (index)
          return Response.redirect(pathUtils.joinURLParts(path, content[0].Name))
        } catch (error) {
          log(error)
          return new Response(errorString, header(500, error.toString()))
        }
      }

      if (errorString.startsWith('Error: no link named')) {
        return new Response(errorString, header(404, errorString))
      }

      if (errorString.startsWith('Error: multihash length inconsistent') || errorString.startsWith('Error: Non-base58 character')) {
        return new Response(errorString, header(400, errorString))
      }

      log(error)
      return new Response(errorString, header(500, errorString))
    }
  }

  // remove trailing slash for files if needed
  if (ipfsPath.endsWith('/')) {
    return Response.redirect(pathUtils.removeTrailingSlash(ipfsPath))
  }

  try {
    const resolvedData = await resolver.cid(ipfsNode, ipfsPath)

    const readableStream = ipfsNode.catReadableStream(resolvedData.cid)
    const responseStream = new stream.PassThrough({ highWaterMark: 1 })
    readableStream.pipe(responseStream)

    return new Promise((resolve, reject) => {
      readableStream.once('error', (error) => {
        if (error) {
          log(error)
          return resolve(new Response(error.toString(), header(500, 'Error fetching the file')))
        }
      })

      // return only after first chunk being checked
      let contentTypeDetected = false
      readableStream.on('data', async (chunk) => {
        // check mime on first chunk
        if (contentTypeDetected) {
          return
        }

        contentTypeDetected = true
        // return Response with mime type
        const contentType = detectContentType(ipfsPath, chunk)

        if (typeof Blob === 'undefined') {
          return contentType
            ? resolve(new Response(responseStream, header(200, 'OK', { 'Content-Type': contentType })))
            : resolve(new Response(responseStream, header()))
        }

        try {
          const blob = await toBlob(responseStream)

          return contentType
            ? resolve(new Response(blob, header(200, 'OK', { 'Content-Type': contentType })))
            : resolve(new Response(blob, header()))
        } catch (err) {
          return resolve(new Response(err.toString(), header(500, 'Error fetching the file')))
        }
      })
    })
  } catch (error) {
    log(error)
    return handleResolveError(ipfsNode, ipfsPath, error)
  }
}

module.exports = {
  getResponse: response,
  resolver: resolver
}
