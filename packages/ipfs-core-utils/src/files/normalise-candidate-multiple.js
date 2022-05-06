import errCode from 'err-code'
import browserStreamToIt from 'browser-readablestream-to-it'
import itPeekable from 'it-peekable'
import map from 'it-map'
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
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidate} ImportCandidate
 * @typedef {import('ipfs-core-types/src/utils').ToContent} ToContent
 * @typedef {import('ipfs-unixfs-importer').ImportCandidate} ImporterImportCandidate
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidateStream} ImportCandidateStream
 */

/**
 * @param {ImportCandidateStream} input
 * @param {(content:ToContent) => Promise<AsyncIterable<Uint8Array>>} normaliseContent
 */
// eslint-disable-next-line complexity
export async function * normaliseCandidateMultiple (input, normaliseContent) {
  // String
  // Uint8Array|ArrayBuffer|TypedArray
  // Blob|File
  // fs.ReadStream
  // @ts-expect-error _readableState is a property of a node fs.ReadStream
  if (typeof input === 'string' || input instanceof String || isBytes(input) || isBlob(input) || input._readableState) {
    throw errCode(new Error('Unexpected input: single item passed - if you are using ipfs.addAll, please use ipfs.add instead'), 'ERR_UNEXPECTED_INPUT')
  }

  // Browser ReadableStream
  if (isReadableStream(input)) {
    input = browserStreamToIt(input)
  }

  // Iterable<?>
  if (Symbol.iterator in input || Symbol.asyncIterator in input) {
    const peekable = itPeekable(input)
    const { value, done } = await peekable.peek()

    if (done) {
      // make sure empty iterators result in empty files
      yield * []
      return
    }

    peekable.push(value)

    // (Async)Iterable<Number>
    // (Async)Iterable<Bytes>
    if (Number.isInteger(value)) {
      throw errCode(new Error('Unexpected input: single item passed - if you are using ipfs.addAll, please use ipfs.add instead'), 'ERR_UNEXPECTED_INPUT')
    }

    // (Async)Iterable<fs.ReadStream>
    // @ts-expect-error private field
    if (value._readableState) {
      // @ts-expect-error Node fs.ReadStreams have a `.path` property so we need to pass it as the content
      yield * map(peekable, (/** @type {ImportCandidate} */ value) => toFileObject({ content: value }, normaliseContent))
      return
    }

    if (isBytes(value)) {
      // @ts-expect-error peekable is still an iterable of ImportCandidates
      yield toFileObject({ content: peekable }, normaliseContent)
      return
    }

    // (Async)Iterable<(Async)Iterable<?>>
    // (Async)Iterable<ReadableStream<?>>
    // ReadableStream<(Async)Iterable<?>>
    // ReadableStream<ReadableStream<?>>
    if (isFileObject(value) || value[Symbol.iterator] || value[Symbol.asyncIterator] || isReadableStream(value) || isBlob(value)) {
      yield * map(peekable, (/** @type {ImportCandidate} */ value) => toFileObject(value, normaliseContent))
      return
    }
  }

  // { path, content: ? }
  // Note: Detected _after_ (Async)Iterable<?> because Node.js fs.ReadStreams have a
  // `path` property that passes this check.
  if (isFileObject(input)) {
    throw errCode(new Error('Unexpected input: single item passed - if you are using ipfs.addAll, please use ipfs.add instead'), 'ERR_UNEXPECTED_INPUT')
  }

  throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
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
