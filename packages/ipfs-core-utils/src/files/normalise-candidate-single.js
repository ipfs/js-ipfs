import errCode from 'err-code'
import browserStreamToIt from 'browser-readablestream-to-it'
import itPeekable from 'it-peekable'
import {
  isBytes,
  isBlob,
  isReadableStream,
  isFileObject
} from './utils.js'
import {
  parseMtime,
  parseMode
} from 'ipfs-unixfs'

/**
 * @typedef {import('ipfs-core-types/src/utils').ToContent} ToContent
 * @typedef {import('ipfs-unixfs-importer').ImportCandidate} ImporterImportCandidate
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidate} ImportCandidate
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidateStream} ImportCandidateStream
 */

/**
 * @param {ImportCandidate} input
 * @param {(content:ToContent) => Promise<AsyncIterable<Uint8Array>>} normaliseContent
 */
// eslint-disable-next-line complexity
export async function * normaliseCandidateSingle (input, normaliseContent) {
  if (input === null || input === undefined) {
    throw errCode(new Error(`Unexpected input: ${input}`), 'ERR_UNEXPECTED_INPUT')
  }

  // String
  if (typeof input === 'string' || input instanceof String) {
    yield toFileObject(input.toString(), normaliseContent)
    return
  }

  // Uint8Array|ArrayBuffer|TypedArray
  // Blob|File
  if (isBytes(input) || isBlob(input)) {
    yield toFileObject(input, normaliseContent)
    return
  }

  // Browser ReadableStream
  if (isReadableStream(input)) {
    input = browserStreamToIt(input)
  }

  // Iterable<?>
  if (Symbol.iterator in input || Symbol.asyncIterator in input) {
    const peekable = itPeekable(input)

    /** @type {any} value **/
    const { value, done } = await peekable.peek()

    if (done) {
      // make sure empty iterators result in empty files
      yield { content: [] }
      return
    }

    peekable.push(value)

    // (Async)Iterable<Number>
    // (Async)Iterable<Bytes>
    // (Async)Iterable<String>
    if (Number.isInteger(value) || isBytes(value) || typeof value === 'string' || value instanceof String) {
      yield toFileObject(peekable, normaliseContent)
      return
    }

    throw errCode(new Error('Unexpected input: multiple items passed - if you are using ipfs.add, please use ipfs.addAll instead'), 'ERR_UNEXPECTED_INPUT')
  }

  // { path, content: ? }
  // Note: Detected _after_ (Async)Iterable<?> because Node.js fs.ReadStreams have a
  // `path` property that passes this check.
  if (isFileObject(input)) {
    yield toFileObject(input, normaliseContent)
    return
  }

  throw errCode(new Error('Unexpected input: cannot convert "' + typeof input + '" into ImportCandidate'), 'ERR_UNEXPECTED_INPUT')
}

/**
 * @param {ImportCandidate} input
 * @param {(content:ToContent) => Promise<AsyncIterable<Uint8Array>>} normaliseContent
 */
async function toFileObject (input, normaliseContent) {
  // @ts-expect-error - Those properties don't exist on most input types
  const { path, mode, mtime, content } = input

  /** @type {ImporterImportCandidate} */
  const file = {
    path: path || '',
    mode: parseMode(mode),
    mtime: parseMtime(mtime)
  }

  if (content) {
    file.content = await normaliseContent(content)
  } else if (!path) { // Not already a file object with path or content prop
    // @ts-expect-error - input still can be different ToContent
    file.content = await normaliseContent(input)
  }

  return file
}
