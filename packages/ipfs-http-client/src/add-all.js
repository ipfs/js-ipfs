'use strict'

const { CID } = require('multiformats/cid')
const toCamel = require('./lib/object-to-camel')
const configure = require('./lib/configure')
const multipartRequest = require('./lib/multipart-request')
const toUrlSearchParams = require('./lib/to-url-search-params')
const abortSignal = require('./lib/abort-signal')
const { AbortController } = require('native-abort-controller')

/**
 * @typedef {import('ipfs-utils/src/types').ProgressFn} IPFSUtilsHttpUploadProgressFn
 * @typedef {import('ipfs-core-types/src/root').AddProgressFn} IPFSCoreAddProgressFn
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 * @typedef {import('ipfs-core-types/src/root').AddResult} AddResult
 */

module.exports = configure((api) => {
  /**
   * @type {RootAPI["addAll"]}
   */
  async function * addAll (source, options = {}) {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)
    const { headers, body, total, parts } =
      await multipartRequest(source, controller, options.headers)

    // In browser response body only starts streaming once upload is
    // complete, at which point all the progress updates are invalid. If
    // length of the content is computable we can interpret progress from
    // `{ total, loaded}` passed to `onUploadProgress` and `multipart.total`
    // in which case we disable progress updates to be written out.
    const [progressFn, onUploadProgress] = typeof options.progress === 'function'
      // @ts-ignore tsc picks up the node codepath
      ? createProgressHandler(total, parts, options.progress)
      : [undefined, undefined]

    const res = await api.post('add', {
      searchParams: toUrlSearchParams({
        'stream-channels': true,
        ...options,
        progress: Boolean(progressFn)
      }),
      onUploadProgress,
      signal,
      headers,
      body
    })

    for await (let file of res.ndjson()) {
      file = toCamel(file)

      if (file.hash !== undefined) {
        yield toCoreInterface(file)
      } else if (progressFn) {
        progressFn(file.bytes || 0, file.name)
      }
    }
  }
  return addAll
})

/**
 * Returns simple progress callback when content length isn't computable or a
 * progress event handler that calculates progress from upload progress events.
 *
 * @param {number} total
 * @param {{name:string, start:number, end:number}[]|null} parts
 * @param {IPFSCoreAddProgressFn} progress
 * @returns {[IPFSCoreAddProgressFn|undefined, IPFSUtilsHttpUploadProgressFn|undefined]}
 */
const createProgressHandler = (total, parts, progress) =>
  parts ? [undefined, createOnUploadProgress(total, parts, progress)] : [progress, undefined]

/**
 * Creates a progress handler that interpolates progress from upload progress
 * events and total size of the content that is added.
 *
 * @param {number} size - actual content size
 * @param {{name:string, start:number, end:number}[]} parts
 * @param {IPFSCoreAddProgressFn} progress
 * @returns {IPFSUtilsHttpUploadProgressFn}
 */
const createOnUploadProgress = (size, parts, progress) => {
  let index = 0
  const count = parts.length
  return ({ loaded, total }) => {
    // Derive position from the current progress.
    const position = Math.floor(loaded / total * size)
    while (index < count) {
      const { start, end, name } = parts[index]
      // If within current part range report progress and break the loop
      if (position < end) {
        progress(position - start, name)
        break
      // If passed current part range report final byte for the chunk and
      // move to next one.
      } else {
        progress(end - start, name)
        index += 1
      }
    }
  }
}

/**
 * @param {object} input
 * @param {string} input.name
 * @param {string} input.hash
 * @param {string} input.size
 * @param {string} [input.mode]
 * @param {number} [input.mtime]
 * @param {number} [input.mtimeNsecs]
 */
function toCoreInterface ({ name, hash, size, mode, mtime, mtimeNsecs }) {
  /** @type {AddResult} */
  const output = {
    path: name,
    cid: CID.parse(hash),
    size: parseInt(size)
  }

  if (mode != null) {
    output.mode = parseInt(mode, 8)
  }

  if (mtime != null) {
    output.mtime = {
      secs: mtime,
      nsecs: mtimeNsecs || 0
    }
  }

  return output
}
