// @ts-check
'use strict'

const errCode = require('err-code')
const { File } = require('./file')
const { Blob, readBlob } = require('./blob')

/**
 * @template T
 * @typedef {Iterable<T>|AsyncIterable<T>|ReadableStream<T>} Multiple
 */

/**
 * @typedef {ExtendedFile | FileStream | Directory} NormalizedAddInput
 * @typedef {SingleFileInput | MultiFileInput} Input
 * @typedef {Blob|Bytes|string|FileObject|Iterable<Number>|Multiple<Bytes>} SingleFileInput
 * @typedef {Multiple<Blob>|Multiple<string>|Multiple<FileObject>} MultiFileInput
 *
 * @typedef {Object} FileObject
 * @property {string} [path]
 * @property {FileContent} [content]
 * @property {Mode} [mode]
 * @property {UnixFSTime} [mtime]
 * @typedef {Blob|Bytes|string|Iterable<number>|Multiple<Bytes>} FileContent
 *
 * @typedef {ArrayBuffer|ArrayBufferView} Bytes
 *
 *@typedef {string|number|InstanceType<typeof String>} Mode
 * @typedef {Date|UnixFSTime|UnixFSTimeSpec|HRTime} MTime
 * @typedef {Object} UnixFSTime
 * @property {number} secs
 * @property {number} [nsecs]
 *
 * @typedef {Object} UnixFSTimeSpec
 * @property {number} Seconds
 * @property {number} [FractionalNanoseconds]
 *
 * @typedef {[number, number]} HRTime - Node process.hrtime
 */

/**
 * Normalizes input into async iterable of extended File or custom FileStream
 * objects.
 *
 * @param {Input} input
 * @return {AsyncIterable<NormalizedAddInput>}
 */
module.exports = async function * normaliseInput (input) {
  // must give us something
  if (input == null) {
    throw errCode(new Error(`Unexpected input: ${input}`), 'ERR_UNEXPECTED_INPUT')
  }

  // If input is a one of the following types
  // - string
  // - ArrayBuffer
  // - ArrayBufferView
  // - Blob
  // - FileObject
  // It is turned into collection of one file (with that content)
  const file = asFile(input)
  if (file != null) {
    yield file
    return
  }

  // If input is sync iterable we expect it to be a homogenous collection &
  // need to probe it's first item to tell if input to be interpreted as single
  // file with multiple chunks or multiple files.
  // NOTE: We had to ensure that input was not string or arraybuffer view
  // because those are also iterables.
  /** @type {null|Iterable<*>} */
  const iterable = asIterable(input)
  if (iterable != null) {
    yield * normaliseIterableInput(iterable)

    // Return here since we have have exhasted an input iterator.
    return
  }

  // If we got here than we are dealing with async input, which can be either
  // readable stream or an async iterable (casting former to later)
  const stream = asReadableStream(input)
  const asyncIterable = stream
    ? iterateReadableStream(stream)
    : asAsyncIterable(input)

  // Async iterable (which we assume to be homogenous) may represent single file
  // with multilpe chunks or multiple files, to decide we probe it's first item.
  if (asyncIterable != null) {
    // Create peekable to be able to probe head without consuming it.
    const peekable = AsyncPeekable.from(asyncIterable)
    const { done, value } = await peekable.peek()
    // If done input was empty so we return early.
    if (done) {
      return
    }

    // If first item is array buffer or one of it's views input represents a
    // single file with multiple chunks.
    if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
      yield new FileStream(peekable, '')
    // Otherwise we interpret input as async collection of multiple files.
    // In that case itemss of input can be either `string`, `Blob` or
    // `FileObject`, so we normalize each to a file. If item is anything else
    // we throw an exception.
    } else {
      for await (const content of peekable) {
        // Note: If content here is `ArrayBuffer` or a view this will turn it
        // into a file, but that can only occur if async iterable contained
        // variadic chunks which is not supported.
        const file = asFile(content)
        if (file) {
          yield file
        } else {
          throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
        }
      }
    }

    return
  }

  throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
}

/**
 *
 * @param {Iterable<ArrayBuffer>|Iterable<ArrayBufferView>} iterable
 * @returns {Iterable<ExtendedFile|FileStream|Directory>}
 * @typedef {Iterable<number>|Iterable<ArrayBuffer>|Iterable<ArrayBufferView>} IterableFileContent
 * @typedef {Iterable<string>|Iterable<Blob>|Iterable<FileObject>} IterableFiles
 */
const normaliseIterableInput = function * (iterable) {
  // In order to peek at first without loosing capablitiy to iterate, we
  // create peekable which allows us to do that.
  const peekable = Peekable.from(iterable)
  // First try to interpret it a single file content chunks.
  const bytes = asIterableBytes(peekable)
  if (bytes != null) {
    yield new ExtendedFile(bytes, '')
    // If first item is a `Blob`, `string`, or a `FileObject` we treat this
    // input as collection of files. We iterate and normalize each each value
    // into a file.
  } else {
    for (const content of peekable) {
      const file = asFile(content)
      if (file) {
        yield file
      } else {
        throw errCode(new Error('Unexpected input: ' + typeof content), 'ERR_UNEXPECTED_INPUT')
      }
    }
  }

  // Otherwise eslint complains about lack of return
  return undefined
}

/**
 * Utility function takes any input and returns a `File|FileStream|Directoriy`
 * (containing that input) if input was one of the following types (or `null`
 * otherwise):
 * - `ArrayBuffer`
 * - `ArrayBufferView`
 * - `string`
 * - `Blob`
 * - `FileObject`
 * It will return `File` instance when content is of known size (not a stream)
 * other it returns a `FileStream`. If input is `FileObject` with no `content`
 * returns `Directory`.
 * @param {any} input
 * @param {string} [name] - optional name for the file
 * @returns {null|ExtendedFile|FileStream|Directory}
 */
const asFile = (input, name) => {
  const file = asFileFromBlobPart(input, name)
  if (file) {
    return file
  } else {
    // If input is a `FileObject`
    const fileObject = asFileObject(input)
    if (fileObject) {
      return fileFromFileObject(fileObject)
    } else {
      return null
    }
  }
}

/**
 * Utility function takes any input and returns a `File` (containing it)
 * if `input` is of `BlobPart` type, otherwise returns `null`. If optional
 * `name` is passed it will be used as a file name.
 * @param {any} content
 * @param {string} [name]
 * @param {Object} [options]
 * @param {string} [options.path]
 * @param {Mode} [options.mode]
 * @param {MTime} [options.mtime]
 * @returns {ExtendedFile|null}
 */
const asFileFromBlobPart = (content, name, options = {}) => {
  if (
    typeof content === 'string' ||
    ArrayBuffer.isView(content) ||
    content instanceof ArrayBuffer
  ) {
    return new ExtendedFile([content], name || '', options)
  } else if (content instanceof Blob) {
    // Third argument is passed to preserve a mime type.
    return new ExtendedFile([content], name || '', { ...options, type: content.type })
  } else if (content instanceof String) {
    return new ExtendedFile([content.toString()], name || '', options)
  } else {
    return null
  }
}

/**
 * Utility function takes a `FileObject` and returns a web `File` (with extended)
 * attributes if content is of known size or a `FileStream` if content is an
 * async stream or `Directory` if it has no content.
 * @param {FileObject} fileObject
 * @returns {null|ExtendedFile|FileStream|Directory}
 */
const fileFromFileObject = (fileObject) => {
  const { path, mtime, mode, content } = fileObject
  const ext = { mtime, mode, path }
  const name = path == null ? undefined : basename(path)
  const file = asFileFromBlobPart(content, name, ext)
  if (file) {
    return file
  } else {
    // If content is empty it is a diretory
    if (content == null) {
      return new Directory(name, ext)
    }

    // First try to interpret it a single file content chunks.
    const iterable = asIterable(content)
    if (iterable != null) {
      const peekable = Peekable.from(iterable)
      // File object content can only contain iterable of numbers or array
      // buffers (or it's views). If so we create an object otherwise
      // throw an exception.
      const bytes = asIterableBytes(peekable)
      if (bytes != null) {
        return new ExtendedFile(bytes, name, ext)
      } else {
        throw errCode(new Error('Unexpected input: ' + typeof content), 'ERR_UNEXPECTED_INPUT')
      }
    }

    // If we got here than we are dealing with async input, which can be either
    // readable stream or an async iterable (casting former to later)
    const stream = asReadableStream(content)
    const asyncIterable = stream
      ? iterateReadableStream(stream)
      : asAsyncIterable(content)
    if (asyncIterable != null) {
      return new FileStream(asyncIterable, name, ext)
    }

    throw errCode(new Error(`Unexpected FileObject content: ${content}`), 'ERR_UNEXPECTED_INPUT')
  }
}

/**
 * @param {Peekable<any>} content
 * @returns {ArrayBufferView[]|ArrayBuffer[]|null}
 */
const asIterableBytes = (content) => {
  const { done, value } = content.peek()
  // If it is done input was empty collection so we return early.
  if (done) {
    return []
  }

  // If first item is an integer we treat input as a byte array and result
  // will be collection of one file contaning those bytes.
  if (Number.isInteger(value)) {
    const bytes = new Uint8Array(content)
    return [bytes]

    // If first item is array buffer or it's view, it is interpreted as chunks
    // of one file. In that case we collect all chunks and normalize input into
    // collection with a single file containing those chunks.
    // Note: Since this is a synchronous iterator all chunks are already in
    // memory so by by collecting them into a single file we are not allocate
    // new memory (unless iterator is generating content, but that is exotic
    // enough use case that we prefer to go with File over FileStream).
  } else if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    return [...content]
  } else {
    return null
  }
}

/**
 * Pattern matches given `input` as `ReadableStream` and return back either
 * matched input or `null`.
 *
 * @param {any} input
 * @returns {ReadableStream<Uint8Array>|null}
 */
const asReadableStream = input => {
  if (input && typeof input.getReader === 'function') {
    return input
  } else {
    return null
  }
}

/**
 * Pattern matches given `input` as `AsyncIterable<I>` and returns back either
 * matched `AsyncIterable` or `null`.
 * @template I
 * @param {AsyncIterable<I>|Input} input
 * @returns {AsyncIterable<I>|null}
 */
const asAsyncIterable = input => {
  /** @type {*} */
  const object = input
  if (object && typeof object[Symbol.asyncIterator] === 'function') {
    return object
  } else {
    return null
  }
}

/**
 * Pattern matches given input as `Iterable<I>` and returns back either matched
 * iterable or `null`.
 * @template I
 * @param {Iterable<I>|Input} input
 * @returns {Iterable<I>|null}
 */
const asIterable = input => {
  /** @type {*} */
  const object = input
  if (object && typeof object[Symbol.iterator] === 'function') {
    return object
  } else {
    return null
  }
}

/**
 * Pattern matches given input as "FileObject" and returns back eithr matched
 * input or `null`.
 * @param {*} input
 * @returns {FileObject|null}
 */
const asFileObject = input => {
  if (typeof input === 'object' && (input.path || input.content)) {
    return input
  } else {
    return null
  }
}
/**
 * @template T
 * @param {ReadableStream<T>} stream
 * @returns {AsyncIterable<T>}
 */

const iterateReadableStream = async function * (stream) {
  const reader = stream.getReader()

  while (true) {
    const result = await reader.read()

    if (result.done) {
      return
    }

    yield result.value
  }
}

/**
 * @template T
 */
class Peekable {
  /**
   * @template T
   * @template {Iterable<T>} I
   * @param {I} iterable
   * @returns {Peekable<T>}
   */
  static from (iterable) {
    return new Peekable(iterable)
  }

  /**
   * @private
   * @param {Iterable<T>} iterable
   */
  constructor (iterable) {
    const iterator = iterable[Symbol.iterator]()
    /** @private */
    this.first = iterator.next()
    /** @private */
    this.rest = iterator
  }

  peek () {
    return this.first
  }

  next () {
    const { first, rest } = this
    this.first = rest.next()
    return first
  }

  [Symbol.iterator] () {
    return this
  }

  [Symbol.asyncIterator] () {
    return this
  }
}

/**
 * @template T
 */
class AsyncPeekable {
  /**
   * @template T
   * @template {AsyncIterable<T>} I
   * @param {I} iterable
   * @returns {AsyncPeekable<T>}
   */
  static from (iterable) {
    return new AsyncPeekable(iterable)
  }

  /**
   * @private
   * @param {AsyncIterable<T>} iterable
   */
  constructor (iterable) {
    const iterator = iterable[Symbol.asyncIterator]()
    /** @private */
    this.first = iterator.next()
    /** @private */
    this.rest = iterator
  }

  peek () {
    return this.first
  }

  next () {
    const { first, rest } = this
    this.first = rest.next()
    return first
  }

  [Symbol.asyncIterator] () {
    return this
  }
}

/**
 * @param {string} path
 * @returns {string}
 */
const basename = (path) =>
  path.split(/\\|\//).pop()

class ExtendedFile extends File {
  /**
   * @param {BlobPart[]} init
   * @param {string} name - A USVString representing the file name or the path
   * to the file.
   * @param {Object} [options]
   * @param {string} [options.type] -  A DOMString representing the MIME type
   * of the content that will be put into the file. Defaults to a value of "".
   * @param {number} [options.lastModified] - A number representing the number
   * of milliseconds between the Unix time epoch and when the file was last
   * modified. Defaults to a value of Date.now().
   * @param {string} [options.path]
   * @param {Mode} [options.mode]
   * @param {MTime} [options.mtime]
   */
  constructor (init, name, options = {}) {
    super(init, name, options)
    const { path, mode, mtime } = options
    this.path = path || ''
    this.mode = mode
    this.mtime = mtime

    /** @type {'file'} */
    this.kind = 'file'
  }

  /**
   * @returns {AsyncIterable<Uint8Array>}
   */
  get content () {
    return readBlob(this)
  }
}
// It appears that in electron native `File` has read-only `path` property,
// overriding it the property so that constructor can set a `path`.
Object.defineProperty(ExtendedFile.prototype, 'path', { writable: true })
module.exports.ExtendedFile = ExtendedFile

class FileStream {
  /**
   * @param {AsyncIterable<ArrayBuffer|ArrayBufferView>} source
   * @param {string} name
   * @param {Object} [options]
   * @param {string} [options.type]
   * @param {number} [options.lastModified]
   * @param {string} [options.path]
   * @param {MTime} [options.mtime]
   * @param {Mode} [options.mode]
   */
  constructor (source, name, options = {}) {
    this.source = source
    this.name = name
    this.type = options.type || ''
    this.lastModified = options.lastModified || Date.now()
    this.path = options.path || ''
    this.mtime = options.mtime
    this.mode = options.mode

    /** @type {'file-stream'} */
    this.kind = 'file-stream'
  }

  get size () {
    throw Error('File size is unknown')
  }

  async * [Symbol.asyncIterator] () {
    for await (const chunk of this.source) {
      if (ArrayBuffer.isView(chunk)) {
        yield chunk
      } else if (chunk instanceof ArrayBuffer) {
        yield new Uint8Array(chunk)
      } else {
        throw errCode(new Error(`Unexpected file content: ${chunk}`), 'ERR_UNEXPECTED_INPUT')
      }
    }
  }

  get content () {
    return this
  }
}
module.exports.FileStream = FileStream

class Directory {
  /**
   * @param {string} name
   * @param {Object} [options]
   * @param {string} [options.type]
   * @param {number} [options.lastModified]
   * @param {string} [options.path]
   * @param {MTime} [options.mtime]
   * @param {Mode} [options.mode]
   */
  constructor (name, options = {}) {
    this.name = name
    this.type = options.type || ''
    this.lastModified = options.lastModified || Date.now()
    this.path = options.path || ''
    this.mtime = options.mtime
    this.mode = options.mode

    /** @type {'directory'} */
    this.kind = 'directory'
    /** @type {void} */
    this.content = undefined
  }
}
module.exports.Directory = Directory
