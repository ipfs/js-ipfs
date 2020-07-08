// @ts-check
'use strict'

const normaliseInput = require('ipfs-core-utils/src/files/normalise-input')
const toBody = require('./to-body')
const modeToHeaders = require('../lib/mode-to-headers')
const mtimeToHeaders = require('../lib/mtime-to-headers')
const merge = require('merge-options').bind({ ignoreUndefined: true })
const { FormDataEncoder } = require('./form-data-encoder')

/**
 * @typedef {import('ipfs-core-utils/src/files/normalise-input').Input} Source
 * @typedef {import('stream').Readable} NodeReadableStream
 * @typedef {import('./form-data-encoder').Part} Part
 * @typedef {import('./form-data-encoder').Headers} Headers
 *
 * @typedef {Object} MultipartRequest
 * @property {Headers} headers
 * @property {NodeReadableStream|Blob} body
 */

/**
 * @param {Source} source
 * @param {AbortController} [abortController]
 * @param {Headers} [headers]
 * @param {string} [boundary]
 * @returns {Promise<MultipartRequest>}
 */
async function multipartRequest (source = '', abortController, headers = {}, boundary) {
  const encoder = new FormDataEncoder({ boundary })
  const data = encoder.encode(toFormDataParts(source, abortController))
  // In node this will produce readable stream, in browser it will
  // produce a blob instance.
  const body = await toBody(data)

  return {
    headers: merge(headers, {
      'Content-Type': encoder.type
    }),
    body
  }
}

/**
 * Takes `ipfs.add` input and turns it into async iterable of form-data parts
 * that `FormDataEncoder` encode.
 * @param {Source} source
 * @param {AbortController} [abortController]
 * @returns {AsyncIterable<Part>}
 */
async function * toFormDataParts (source, abortController) {
  try {
    let index = 0
    for await (const input of normaliseInput(source)) {
      const { kind, path, mode, mtime } = input
      const type = kind === 'directory' ? 'dir' : 'file'
      const suffix = index > 0 ? `-${index}` : ''
      const name = `${type}${suffix}`
      const filename = path
      const headers = {
        'Content-Type': type === 'file' ? 'application/octet-stream' : 'application/x-directory',
        ...(mtime && mtimeToHeaders(mtime)),
        ...(mode && modeToHeaders(mode))
      }
      // If `input.kind` is a 'file' than input is an `ExtendedFile` instance
      // and we do not want touch it's content because that would read the
      // underlying blob in browser. Instead we pass it as is so that encoder
      // can inline it. Otherwise it's either `Directory` that has not content
      // or `FileStream` which can't be inlined so it will be read and inlined.
      const content = input.kind === 'file' ? input : input.content

      yield {
        name,
        content,
        filename,
        headers
      }

      index++
    }
  } catch (err) {
    // workaround for https://github.com/node-fetch/node-fetch/issues/753
    // @ts-ignore - abort does not take an argument
    abortController.abort(err)
  }
}

module.exports = multipartRequest
