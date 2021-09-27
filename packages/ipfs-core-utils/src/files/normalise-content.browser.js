import errCode from 'err-code'
import itPeekable from 'it-peekable'
import browserStreamToIt from 'browser-readablestream-to-it'
import all from 'it-all'
import {
  isBytes,
  isBlob,
  isReadableStream
} from './utils.js'

/**
 * @param {import('ipfs-core-types/src/utils').ToContent} input
 */
export async function normaliseContent (input) {
  // Bytes
  if (isBytes(input)) {
    return new Blob([input])
  }

  // String
  if (typeof input === 'string' || input instanceof String) {
    return new Blob([input.toString()])
  }

  // Blob | File
  if (isBlob(input)) {
    return input
  }

  // Browser stream
  if (isReadableStream(input)) {
    input = browserStreamToIt(input)
  }

  // (Async)Iterator<?>
  if (Symbol.iterator in input || Symbol.asyncIterator in input) {
    /** @type {any} peekable */
    const peekable = itPeekable(input)

    /** @type {any} value **/
    const { value, done } = await peekable.peek()

    if (done) {
      // make sure empty iterators result in empty files
      return itToBlob(peekable)
    }

    peekable.push(value)

    // (Async)Iterable<Number>
    if (Number.isInteger(value)) {
      return new Blob([Uint8Array.from(await all(peekable))])
    }

    // (Async)Iterable<Bytes|String>
    if (isBytes(value) || typeof value === 'string' || value instanceof String) {
      return itToBlob(peekable)
    }
  }

  throw errCode(new Error(`Unexpected input: ${input}`), 'ERR_UNEXPECTED_INPUT')
}

/**
 * @param {AsyncIterable<BlobPart>|Iterable<BlobPart>} stream
 */
async function itToBlob (stream) {
  const parts = []

  for await (const chunk of stream) {
    parts.push(chunk)
  }

  return new Blob(parts)
}
