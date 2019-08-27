'use strict'

const Content = require('@hapi/content')
const multipart = require('it-multipart')

const multipartFormdataType = 'multipart/form-data'
const applicationDirectory = 'application/x-directory'
const applicationSymlink = 'application/symlink'

const isDirectory = (mediatype) => mediatype === multipartFormdataType || mediatype === applicationDirectory

const parseDisposition = (disposition) => {
  const details = {}
  details.type = disposition.split(';')[0]
  if (details.type === 'file' || details.type === 'form-data') {
    const namePattern = / filename="(.[^"]+)"/
    const matches = disposition.match(namePattern)
    details.name = matches ? matches[1] : ''
  }

  return details
}

const parseHeader = (header) => {
  const type = Content.type(header['content-type'])
  const disposition = parseDisposition(header['content-disposition'])

  const details = type
  details.name = decodeURIComponent(disposition.name)
  details.type = disposition.type

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

async function * parser (stream, options) {
  for await (const part of multipart(stream, options.boundary)) {
    const partHeader = parseHeader(part.headers)

    if (isDirectory(partHeader.mime)) {
      yield {
        type: 'directory',
        name: partHeader.name
      }

      await ignore(part.body)

      continue
    }

    if (partHeader.mime === applicationSymlink) {
      const target = await collect(part.body)

      yield {
        type: 'symlink',
        name: partHeader.name,
        target: target.toString('utf8')
      }

      continue
    }

    if (partHeader.boundary) {
      // recursively parse nested multiparts
      for await (const entry of parser(part, {
        ...options,
        boundary: partHeader.boundary
      })) {
        yield entry
      }

      continue
    }

    yield {
      type: 'file',
      name: partHeader.name,
      content: part.body
    }
  }
}

module.exports = parser
