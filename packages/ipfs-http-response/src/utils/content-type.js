import { fileTypeFromBuffer } from 'file-type'
import mime from 'mime-types'
import { reader } from 'it-reader'
import map from 'it-map'

const minimumBytes = 4100

/**
 * @typedef {import('uint8arraylist').Uint8ArrayList} Uint8ArrayList
 */

/**
 * @param {string} path
 * @param {AsyncIterable<Uint8Array>} source
 * @returns {Promise<{ source: AsyncIterable<Uint8Array>, contentType?: string }>}
 */
export const detectContentType = async (path, source) => {
  let fileSignature
  /** @type {AsyncIterable<Uint8ArrayList> | undefined} */
  let output

  // try to guess the filetype based on the first bytes
  // note that `file-type` doesn't support svgs, therefore we assume it's a svg if path looks like it
  if (!path.endsWith('.svg')) {
    try {
      const stream = reader(source)
      const { value, done } = await stream.next(minimumBytes)

      if (done) {
        return {
          source: map(stream, (buf) => buf.subarray())
        }
      }

      fileSignature = await fileTypeFromBuffer(value.subarray())

      output = (async function * () { // eslint-disable-line require-await
        yield value
        yield * stream
      })()
    } catch (/** @type {any} */ err) {
      if (err.code !== 'ERR_UNDER_READ') {
        throw err
      }

      // not enough bytes for sniffing, just yield the data
      output = (async function * () { // eslint-disable-line require-await
        yield err.buffer // these are the bytes that were read (if any)
      })()
    }
  }

  // if we were unable to, fallback to the `path` which might contain the extension
  const mimeType = mime.lookup(fileSignature ? fileSignature.ext : path)

  let contentType

  if (mimeType !== false) {
    contentType = mime.contentType(mimeType)

    if (contentType === false) {
      contentType = undefined
    }
  }

  if (output != null) {
    return {
      source: (async function * () {
        for await (const list of output) {
          yield * list
        }
      }()),
      contentType
    }
  }

  return { source, contentType }
}
