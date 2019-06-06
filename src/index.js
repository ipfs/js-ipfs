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

const response = (ipfsNode, ipfsPath) => {
  // handle hash resolve error (simple hash, test for directory now)
  const handleResolveError = (node, path, error) => {
    if (error) {
      const errorString = error.toString()

      return new Promise((resolve, reject) => {
        // switch case with true feels so wrong.
        switch (true) {
          case (errorString.includes('dag node is a directory')):
            resolver.directory(node, path, error.cid)
              .then((content) => {
                // dir render
                if (typeof content === 'string') {
                  resolve(new Response(content, header(200, 'OK', { 'Content-Type': 'text/html' })))
                }

                // redirect to dir entry point (index)
                resolve(Response.redirect(pathUtils.joinURLParts(path, content[0].Name)))
              })
              .catch((error) => {
                log(error)
                resolve(new Response(errorString, header(500, error.toString())))
              })
            break
          case errorString.startsWith('Error: no link named'):
            resolve(new Response(errorString, header(404, errorString)))
            break
          case errorString.startsWith('Error: multihash length inconsistent'):
          case errorString.startsWith('Error: Non-base58 character'):
            resolve(new Response(errorString, header(400, errorString)))
            break
          default:
            log(error)
            resolve(new Response(errorString, header(500, errorString)))
        }
      })
    }
  }

  return new Promise((resolve, reject) => {
    // remove trailing slash for files if needed
    if (ipfsPath.endsWith('/')) {
      resolve(Response.redirect(pathUtils.removeTrailingSlash(ipfsPath)))
    }

    resolver.cid(ipfsNode, ipfsPath)
      .then((resolvedData) => {
        const readableStream = ipfsNode.catReadableStream(resolvedData.cid)
        const responseStream = new stream.PassThrough({ highWaterMark: 1 })
        readableStream.pipe(responseStream)

        readableStream.once('error', (error) => {
          if (error) {
            log(error)
            resolve(new Response(error.toString(), header(500, 'Error fetching the file')))
          }
        })

        // return only after first chunk being checked
        let contentTypeDetected = false
        readableStream.on('data', (chunk) => {
          // check mime on first chunk
          if (contentTypeDetected) {
            return
          }

          contentTypeDetected = true
          // return Response with mime type
          const contentType = detectContentType(ipfsPath, chunk)

          if (typeof Blob === 'undefined') {
            if (contentType) {
              resolve(new Response(responseStream, header(200, 'OK', { 'Content-Type': contentType })))
            } else {
              resolve(new Response(responseStream, header()))
            }
          } else {
            toBlob(responseStream, (err, blob) => {
              if (err) {
                resolve(new Response(err.toString(), header(500, 'Error fetching the file')))
              }

              if (contentType) {
                resolve(new Response(blob, header(200, 'OK', { 'Content-Type': contentType })))
              } else {
                resolve(new Response(blob, header()))
              }
            })
          }
        })
      })
      .catch((error) => {
        log(error)
        resolve(handleResolveError(ipfsNode, ipfsPath, error))
      })
  })
}

module.exports = {
  getResponse: response,
  resolver: resolver
}
