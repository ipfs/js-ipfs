'use strict'

const Content = require('@hapi/content')
const multipart = require('it-multipart')
const { Buffer } = require('buffer')

const multipartFormdataType = 'multipart/form-data'
const applicationDirectory = 'application/x-directory'
const applicationSymlink = 'application/symlink'

const isDirectory = (mediatype) => mediatype === multipartFormdataType || mediatype === applicationDirectory

const parseDisposition = (disposition) => {
  const details = {}
  details.type = disposition.split(';')[0]

  if (details.type === 'file' || details.type === 'form-data') {
    const filenamePattern = / filename="(.[^"]+)"/
    const filenameMatches = disposition.match(filenamePattern)
    details.filename = filenameMatches ? filenameMatches[1] : ''

    const namePattern = / name="(.[^"]+)"/
    const nameMatches = disposition.match(namePattern)
    details.name = nameMatches ? nameMatches[1] : ''
  }

  return details
}

const collect = async (stream) => {
  const buffers = []
  let size = 0

  for await (const buf of stream) {
    size += buf.length
    buffers.push(buf)
  }

  return Buffer.concat(buffers, size)
}

const ignore = async (stream) => {
  for await (const _ of stream) { // eslint-disable-line no-unused-vars

  }
}

async function * parseEntry (stream, options) {
  for await (const part of stream) {
    if (!part.headers['content-type']) {
      throw new Error('No content-type in multipart part')
    }

    const type = Content.type(part.headers['content-type'])

    if (type.boundary) {
      // recursively parse nested multiparts
      yield * parser(part.body, {
        ...options,
        boundary: type.boundary
      })

      continue
    }

    if (!part.headers['content-disposition']) {
      throw new Error('No content disposition in multipart part')
    }

    const entry = {}

    if (part.headers.mtime) {
      entry.mtime = {
        secs: parseInt(part.headers.mtime, 10)
      }

      if (part.headers['mtime-nsecs']) {
        entry.mtime.nsecs = parseInt(part.headers['mtime-nsecs'], 10)
      }
    }

    if (part.headers.mode) {
      entry.mode = parseInt(part.headers.mode, 8)
    }

    if (isDirectory(type.mime)) {
      entry.type = 'directory'
    } else if (type.mime === applicationSymlink) {
      entry.type = 'symlink'
    } else {
      entry.type = 'file'
    }

    const disposition = parseDisposition(part.headers['content-disposition'])

    entry.name = decodeURIComponent(disposition.filename)
    entry.body = part.body

    yield entry
  }
}

async function * parser (stream, options) {
  for await (const entry of parseEntry(multipart(stream, options.boundary), options)) {
    if (entry.type === 'directory') {
      yield {
        type: 'directory',
        name: entry.name,
        mtime: entry.mtime,
        mode: entry.mode
      }

      await ignore(entry.body)
    }

    if (entry.type === 'symlink') {
      yield {
        type: 'symlink',
        name: entry.name,
        target: (await collect(entry.body)).toString('utf8'),
        mtime: entry.mtime,
        mode: entry.mode
      }
    }

    if (entry.type === 'file') {
      yield {
        type: 'file',
        name: entry.name,
        content: entry.body,
        mtime: entry.mtime,
        mode: entry.mode
      }
    }
  }
}

/**
 * Request Parser
 *
 * @param {Object} req - Request
 * @param {Object} options - Options passed to stream constructors
 * @returns {Object} an async iterable
 */
module.exports = (req, options = {}) => {
  options.boundary = Content.type(req.headers['content-type']).boundary

  return parser(req.payload || req, options)
}
