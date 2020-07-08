// @ts-check
'use strict'

const { TextEncoder, TextDecoder } = require('util')

class Blob {
  /**
   *
   * @param {BlobPart[]} init
   * @param {Object} [options]
   * @param {string} [options.type]
   *
   */
  constructor (init, options = {}) {
    /** @type {Uint8Array[]} */
    const parts = []

    let size = 0
    for (const part of init) {
      if (typeof part === 'string') {
        const bytes = new TextEncoder().encode(part)
        parts.push(bytes)
        size += bytes.byteLength
      } else if (part instanceof Blob) {
        size += part.size
        // @ts-ignore - `_parts` is marked private so TS will complain about
        // accessing it.
        parts.push(...part._parts)
      } else if (part instanceof ArrayBuffer) {
        parts.push(new Uint8Array(part))
        size += part.byteLength
      } else if (part instanceof Uint8Array) {
        parts.push(part)
        size += part.byteLength
      } else if (ArrayBuffer.isView(part)) {
        const { buffer, byteOffset, byteLength } = part
        parts.push(new Uint8Array(buffer, byteOffset, byteLength))
        size += byteLength
      } else {
        throw new TypeError(`Can not convert ${part} value to a BlobPart`)
      }
    }

    /** @private */
    this._size = size
    /** @private */
    this._type = options.type || ''
    /** @private */
    this._parts = parts
  }

  /**
   * A string indicating the MIME type of the data contained in the Blob.
   * If the type is unknown, this string is empty.
   * @type {string}
   */
  get type () {
    return this._type
  }

  /**
   * The size, in bytes, of the data contained in the Blob object.
   * @type {number}
   */
  get size () {
    return this._size
  }

  /**
   * Returns a new Blob object containing the data in the specified range of
   * bytes of the blob on which it's called.
   * @param {number} [start=0] - An index into the Blob indicating the first
   * byte to include in the new Blob. If you specify a negative value, it's
   * treated as an offset from the end of the Blob toward the beginning. For
   * example, `-10` would be the 10th from last byte in the Blob. The default
   * value is `0`. If you specify a value for start that is larger than the
   * size of the source Blob, the returned Blob has size 0 and contains no
   * data.
   * @param {number} [end] - An index into the `Blob` indicating the first byte
   *  that will *not* be included in the new `Blob` (i.e. the byte exactly at
   * this index is not included). If you specify a negative value, it's treated
   * as an offset from the end of the Blob toward the beginning. For example,
   * `-10` would be the 10th from last byte in the `Blob`. The default value is
   * size.
   * @param {string} [type] - The content type to assign to the new Blob;
   * this will be the value of its type property. The default value is an empty
   * string.
   * @returns {Blob}
   */
  slice (start = 0, end = this.size, type = '') {
    const { size, _parts } = this
    let offset = start < 0
      ? Math.max(size + start, 0)
      : Math.min(start, size)

    let limit = (end < 0 ? Math.max(size + end, 0) : Math.min(end, size))
    const span = Math.max(limit - offset, 0)

    let blobSize = 0
    const blobParts = []
    for (const part of _parts) {
      const { byteLength } = part
      if (offset > 0 && byteLength <= offset) {
        offset -= byteLength
        limit -= byteLength
      } else {
        const chunk = part.subarray(offset, Math.min(byteLength, limit))
        blobParts.push(chunk)
        blobSize += chunk.byteLength
        // no longer need to take that into account
        offset = 0

        // don't add the overflow to new blobParts
        if (blobSize >= span) {
          break
        }
      }
    }

    const blob = new Blob([], { type })
    blob._parts = blobParts
    blob._size = blobSize

    return blob
  }

  /**
   * Returns a promise that resolves with an ArrayBuffer containing the entire
   * contents of the Blob as binary data.
   * @returns {Promise<ArrayBuffer>}
   */
  // eslint-disable-next-line require-await
  async arrayBuffer () {
    const buffer = new ArrayBuffer(this.size)
    const bytes = new Uint8Array(buffer)
    let offset = 0
    for (const part of this._parts) {
      bytes.set(part, offset)
      offset += part.byteLength
    }
    return buffer
  }

  /**
   * Returns a promise that resolves with a USVString containing the entire
   * contents of the Blob interpreted as UTF-8 text.
   * @returns {Promise<string>}
   */
  // eslint-disable-next-line require-await
  async text () {
    const decoder = new TextDecoder()
    let text = ''
    for (const part of this._parts) {
      text += decoder.decode(part)
    }
    return text
  }

  /**
   * @returns {never}
   */
  // eslint-disable-next-line valid-jsdoc
  stream () {
    throw Error('Not implemented')
  }
}

// Marking export as a DOM File object instead of custom class.
/** @type {typeof window.Blob} */
exports.Blob = Blob

/**
 * Universal blob reading function
 * @param {InstanceType<typeof window.Blob>} blob
 * @returns {AsyncIterable<Uint8Array>}
 */
// eslint-disable-next-line require-await
const readBlob = async function * BlobParts (blob) {
  // @ts-ignore - accessing private property
  yield * blob._parts
}
exports.readBlob = readBlob
