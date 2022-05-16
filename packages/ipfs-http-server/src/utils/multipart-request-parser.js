import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import drain from 'it-drain'
// @ts-expect-error no types
import Content from '@hapi/content'
import multipart from 'it-multipart'
import qs from 'querystring'

const multipartFormdataType = 'multipart/form-data'
const applicationDirectory = 'application/x-directory'
const applicationSymlink = 'application/symlink'

/**
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('it-multipart').Part} Part
 * @typedef {import('../types').MultipartEntry} MultipartEntry
 */

/**
 * @param {string} mediatype
 */
const isDirectory = (mediatype) => mediatype === multipartFormdataType || mediatype === applicationDirectory

/**
 * @param {string} disposition
 */
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

/**
 * @param {AsyncIterable<Uint8Array>} stream
 */
const collect = async (stream) => {
  const buffers = []
  let size = 0

  for await (const buf of stream) {
    size += buf.length
    buffers.push(buf)
  }

  return uint8ArrayConcat(buffers, size)
}

/**
 * @typedef {object} MultipartUpload
 * @property {'file' | 'directory' | 'symlink'} type
 * @property {string} name
 * @property {AsyncIterable<Uint8Array>} body
 * @property {number} [mode]
 * @property {import('ipfs-unixfs').Mtime} [mtime]
 *
 * @param {AsyncIterable<Part>} stream
 * @returns {AsyncGenerator<MultipartUpload, void, undefined>}
 */
async function * parseEntry (stream) {
  for await (const part of stream) {
    if (!part.headers['content-type']) {
      throw new Error('No content-type in multipart part')
    }

    const type = Content.type(part.headers['content-type'])

    if (!part.headers['content-disposition']) {
      throw new Error('No content disposition in multipart part')
    }

    /** @type {MultipartUpload} */
    const entry = {}

    if (isDirectory(type.mime)) {
      entry.type = 'directory'
    } else if (type.mime === applicationSymlink) {
      entry.type = 'symlink'
    } else {
      entry.type = 'file'
    }

    const disposition = parseDisposition(part.headers['content-disposition'])
    const query = qs.parse(`${disposition.name}`.split('?').pop() || '')

    if (query.mode) {
      entry.mode = parseInt(readQueryParam(query.mode), 8)
    }

    if (query.mtime) {
      entry.mtime = {
        secs: parseInt(readQueryParam(query.mtime), 10)
      }

      if (query['mtime-nsecs']) {
        entry.mtime.nsecs = parseInt(readQueryParam(query['mtime-nsecs']), 10)
      }
    }

    entry.name = decodeURIComponent(disposition.filename)
    entry.body = part.body

    yield entry
  }
}

/**
 * @param {string|string[]} value
 * @returns {string}
 */
const readQueryParam = value => Array.isArray(value) ? value[0] : value

/**
 * @param {IncomingMessage} stream
 * @returns {AsyncGenerator<MultipartEntry, void, undefined>}
 */
export async function * multipartRequestParser (stream) {
  for await (const entry of parseEntry(multipart(stream))) {
    if (entry.type === 'directory') {
      /** @type {import('../types').MultipartDirectory} */
      yield {
        type: 'directory',
        name: entry.name,
        mtime: entry.mtime,
        mode: entry.mode
      }

      await drain(entry.body)
    }

    if (entry.type === 'symlink') {
      /** @type {import('../types').MultipartSymlink} */
      yield {
        type: 'symlink',
        name: entry.name,
        target: uint8ArrayToString(await collect(entry.body)),
        mtime: entry.mtime,
        mode: entry.mode
      }
    }

    if (entry.type === 'file') {
      /** @type {import('../types').MultipartFile} */
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
