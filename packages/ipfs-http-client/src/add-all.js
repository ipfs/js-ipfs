'use strict'

const CID = require('cids')
const toCamel = require('./lib/object-to-camel')
const configure = require('./lib/configure')
const multipartRequest = require('./lib/multipart-request')
const toUrlSearchParams = require('./lib/to-url-search-params')
const anySignal = require('any-signal')
const AbortController = require('abort-controller').default

module.exports = configure((api) => {
  /**
   * @type {import('../../ipfs/src/core/components/add-all').AddAll<>}
   */
  async function * addAll (input, options = {}) {
    const onUploadProgress = typeof options.progress === 'function'
      ? ({ loaded }) => options.progress(loaded)
      : null

    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = anySignal([controller.signal, options.signal])

    const res = await api.post('add', {
      searchParams: toUrlSearchParams({
        'stream-channels': true,
        ...options,
        // We use `onUploadProgress` instead because in browser response won't
        // stream until body is uploaded, at which point it's usless.
        progress: false
      }),
      timeout: options.timeout,
      onUploadProgress,
      signal,
      ...(
        await multipartRequest(input, controller, options.headers)
      )
    })

    for await (let file of res.ndjson()) {
      file = toCamel(file)

      if (file.hash !== undefined) {
        yield toCoreInterface(file)
      }
    }
  }
  return addAll
})

/**
 * @typedef {import('../../ipfs/src/core/components/add-all').UnixFSEntry} UnixFSEntry
 */

/**
 * @param {*} input
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
 * @typedef {import('./index').HttpOptions} HttpOptions
 * @typedef {Object} HttpAddOptions
 * @property {}
 */
