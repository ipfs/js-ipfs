// @ts-check
'use strict'

const { nanoid } = require('nanoid')
const { Blob } = require('ipfs-core-utils/src/files/blob')
const { from } = require('./async-iterable')

class FormDataEncoder {
/**
 * @param {Object} [options]
 * @param {string} [options.boundary]
 */
  constructor (options = {}) {
    this.boundary = getBoundary(options)
    this.type = `multipart/form-data; boundary=${this.boundary}`
  }

  /**
   *  @param {AsyncIterable<Part>|Iterable<Part>} source
   * @returns {AsyncIterable<BlobPart>}
   */
  async * encode (source) {
    const { boundary } = this
    let first = true
    for await (const part of from(source)) {
      if (!first) {
        yield '\r\n'
        first = false
      }

      yield `--${boundary}\r\n`
      yield * encodeHead(part)
      yield '\r\n'
      yield * encodeBody(part.content)
    }

    yield `\r\n--${boundary}--\r\n`
  }
}
exports.FormDataEncoder = FormDataEncoder

/**
 * @param {void|Blob|AsyncIterable<ArrayBufferView|ArrayBuffer>} content
 * @returns {Iterable<BlobPart>|AsyncIterable<ArrayBuffer|ArrayBufferView>}
 */
function encodeBody (content) {
  if (content == null) {
    return []
  } else if (content instanceof Blob) {
    return [content]
  } else {
    /** @type {AsyncIterable<ArrayBuffer>|AsyncIterable<ArrayBufferView>} */
    const chunks = (content)
    return chunks
  }
}

/**
 * @typedef {Object} Part
 * @property {string} name
 * @property {void|Blob|AsyncIterable<ArrayBufferView|ArrayBuffer>} content
 * @property {string} [filename]
 * @property {Headers} [headers]
 *
 * @typedef {Record<string, string|number>} Headers
 *
 */

/**
 * @param {Part} part
 * @returns {Iterable<string>}
 */
function * encodeHead ({ name, content, filename, headers }) {
  const file = filename || getFileName(content)
  const contentDisposition =
      file == null
        ? `form-data; name="${name}"`
        : `form-data; name="${name}"; filename="${encodeURIComponent(file)}"`

  yield `Content-Disposition: ${contentDisposition}\r\n`

  let hasContentType = false
  if (headers) {
    for (const [name, value] of Object.entries(headers)) {
      // if content type is provided we do no want to derive
      if (name === 'Content-Type' || name === 'content-type') {
        hasContentType = true
      }

      yield `${name}: ${value}\r\n`
    }
  }

  const contentType = !hasContentType ? getContentType(content) : null
  if (contentType != null) {
    yield `Content-Type: ${contentType}\r\n`
  }

  // Otherwise jslint is unhappy.
  return undefined
}

/**
 * @param {any} content
 * @returns {string|null}
 */
const getFileName = (content) =>
  content.filepath || content.webkitRelativePath || content.name || null

const getContentType = (content) =>
  content.type || null

/**
 * @param {Object} options
 * @param {string} [options.boundary]
 * @returns {string}
 */
const getBoundary = ({ boundary }) =>
  (boundary || `-----------------------------${nanoid()}`).toLowerCase()
