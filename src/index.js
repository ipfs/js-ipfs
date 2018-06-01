/* global Response */

'use strict'

const fileType = require('file-type')
const mimeTypes = require('mime-types')
const stream = require('stream')
const nodeToWebStream = require('readable-stream-node-to-web')

const resolver = require('./resolver')
const pathUtils = require('./utils/path')

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
          case (errorString === 'Error: This dag node is a directory'):
            resolver.directory(node, path, error.fileName)
              .then((content) => {
                // dir render
                if (typeof content === 'string') {
                  resolve(new Response(content, header(200, 'OK', { 'Content-Type': 'text/html' })))
                }

                // redirect to dir entry point (index)
                resolve(Response.redirect(pathUtils.joinURLParts(path, content[0].name)))
              })
              .catch((error) => {
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

    resolver.multihash(ipfsNode, ipfsPath)
      .then((resolvedData) => {
        const readableStream = ipfsNode.files.catReadableStream(resolvedData.multihash)
        const responseStream = new stream.PassThrough({ highWaterMark: 1 })
        readableStream.pipe(responseStream)

        readableStream.once('error', (error) => {
          if (error) {
            resolve(new Response(error.toString(), header(500, 'Service Worker Error')))
          }
        })

        // return only after first chunk being checked
        let filetypeChecked = false
        readableStream.on('data', (chunk) => {
          // check mime on first chunk
          if (filetypeChecked) {
            return
          }
          filetypeChecked = true
          // return Response with mime type
          const fileSignature = fileType(chunk)
          const mimeType = mimeTypes.lookup(fileSignature ? fileSignature.ext : null)

          if (mimeType) {
            resolve(
              new Response(typeof ReadableStream === 'function' ? nodeToWebStream(responseStream) : responseStream,
                header(200, 'OK', { 'Content-Type': mimeTypes.contentType(mimeType) }))
            )
          } else {
            resolve(new Response(typeof ReadableStream === 'function' ? nodeToWebStream(responseStream) : responseStream,
              header()))
          }
        })
      })
      .catch((error) => {
        resolve(handleResolveError(ipfsNode, ipfsPath, error))
      })
  })
}

module.exports = {
  getResponse: response,
  resolver: resolver
}
