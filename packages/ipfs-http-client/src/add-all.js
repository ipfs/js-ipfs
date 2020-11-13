'use strict'

const CID = require('cids')
const toCamel = require('./lib/object-to-camel')
const configure = require('./lib/configure')
const multipartRequest = require('./lib/multipart-request')
const toUrlSearchParams = require('./lib/to-url-search-params')
const { anySignal } = require('any-signal')
const AbortController = require('native-abort-controller')

module.exports = configure((api) => {
  /**
   * @type {import('.').Implements<typeof import('ipfs-core/src/components/add-all/index')>}
   */
  async function * addAll (source, options = {}) {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = anySignal([controller.signal, options.signal])
    const { headers, body, total, lengthComputable } =
      await multipartRequest(source, controller, options.headers)

    // In browser response body only starts streaming once upload is
    // complete, at which point all the progress updates are invalid. If
    // length of the content is computable we can interpla te progress from
    // `{ total, loaded}` passed to `onUploadProgress` and `multipart.total`
    // in which case we disable progress updates to be written out.
    const [progressFn, onUploadProgress] = typeof options.progress === 'function'
      ? createProgressHandler(lengthComputable, total, options.progress)
      : [null, null]

    const res = await api.post('add', {
      searchParams: toUrlSearchParams({
        'stream-channels': true,
        ...options,
        progress: Boolean(progressFn)
      }),
      timeout: options.timeout,
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
 * progress event handler that inerpolates progress from upload progress events.
 *
 * @param {boolean} lengthComputable
 * @param {number} total
 * @param {(n:number) => void} progress
 */
const createProgressHandler = (lengthComputable, total, progress) =>
  lengthComputable ? [null, createOnUploadPrgress(total, progress)] : [progress, null]

/**
 * Creates a progress handler that interpolates progress from upload progress
 * events and total size of the content that is added.
 *
 * @param {number} size - actual content size
 * @param {(n:number) => void} progress
 * @returns {(event:{total:number, loaded: number}) => progress}
 */
const createOnUploadPrgress = (size, progress) => ({ loaded, total }) =>
  progress(Math.floor(loaded / total * size))

/**
 * @typedef {import('../../ipfs/src/core/components/add-all').UnixFSEntry} UnixFSEntry
 */

/**
 * @param {any} input
 * @returns {UnixFSEntry}
 */
function toCoreInterface ({ name, hash, size, mode, mtime, mtimeNsecs }) {
  const output = {
    path: name,
    cid: new CID(hash),
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

  // @ts-ignore
  return output
}

/**
 * @typedef {import('ipfs-core/src/components/add-all/index').UnixFSEntry} UnixFSEntry
 * @typedef {import('./index').HttpOptions} HttpOptions
 * @typedef {Object} HttpAddOptions
 * @property {}
 */
