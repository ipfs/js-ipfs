/* global Response, Blob */

'use strict'

const toStream = require('it-to-stream')
const concat = require('it-concat')
const toBuffer = require('it-buffer')
const log = require('debug')('ipfs:http:response')

const resolver = require('./resolver')
const pathUtils = require('./utils/path')
const detectContentType = require('./utils/content-type')

// TODO: pass path and add Etag and X-Ipfs-Path + tests
const getHeader = (status = 200, statusText = 'OK', headers = {}) => ({
  status,
  statusText,
  headers
})

// handle hash resolve error (simple hash, test for directory now)
const handleResolveError = async (node, path, error) => {
  const errorString = error.toString()

  if (errorString.includes('dag node is a directory')) {
    try {
      const content = await resolver.directory(node, path, error.cid)
      // dir render
      if (typeof content === 'string') {
        return new Response(content, getHeader(200, 'OK', { 'Content-Type': 'text/html' }))
      }

      // redirect to dir entry point (index)
      return Response.redirect(pathUtils.joinURLParts(path, content[0].Name))
    } catch (error) {
      log(error)
      return new Response(errorString, getHeader(500, error.toString()))
    }
  }

  if (errorString.startsWith('Error: no link named')) {
    return new Response(errorString, getHeader(404, errorString))
  }

  if (errorString.startsWith('Error: multihash length inconsistent') || errorString.startsWith('Error: Non-base58 character')) {
    return new Response(errorString, getHeader(400, errorString))
  }

  return new Response(errorString, getHeader(500, errorString))
}

const getResponse = async (ipfsNode, ipfsPath) => {
  // remove trailing slash for files if needed
  if (ipfsPath.endsWith('/')) {
    return Response.redirect(pathUtils.removeTrailingSlash(ipfsPath))
  }

  try {
    const resolvedData = await resolver.cid(ipfsNode, ipfsPath)
    const { source, contentType } = await detectContentType(ipfsPath, ipfsNode.cat(resolvedData.cid))

    if (typeof Blob === 'undefined') {
      const responseStream = toStream.readable(toBuffer(source))

      return contentType
        ? new Response(responseStream, getHeader(200, 'OK', { 'Content-Type': contentType }))
        : new Response(responseStream, getHeader())
    }

    try {
      const data = await concat(source)
      const blob = new Blob([data.slice()])

      return contentType
        ? new Response(blob, getHeader(200, 'OK', { 'Content-Type': contentType }))
        : new Response(blob, getHeader())
    } catch (err) {
      return new Response(err.toString(), getHeader(500, 'Error fetching the file'))
    }
  } catch (error) {
    log(error)
    return handleResolveError(ipfsNode, ipfsPath, error)
  }
}

module.exports = {
  getResponse,
  resolver
}
