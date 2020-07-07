// @ts-check
'use strict'

const normaliseInput = require('ipfs-core-utils/src/files/normalise-input')
const toBody = require('./to-body')
const modeToHeaders = require('../lib/mode-to-headers')
const mtimeToHeaders = require('../lib/mtime-to-headers')
const merge = require('merge-options').bind({ ignoreUndefined: true })
const { FormDataEncoder } = require('./form-data-encoder')

async function multipartRequest (source = '', abortController, headers = {}, boundary) {
  async function * parts (source, abortController) {
    try {
      let index = 0
      for await (const input of normaliseInput(source)) {
        const { kind, path, mode, mtime } = input
        const type = kind === 'directory' ? 'dir' : 'file'
        const suffix = index > 0 ? `-${index}` : ''
        const name = `${type}${suffix}`
        const filename = path !== '' ? encodeURIComponent(path) : ''
        const headers = {
          'Content-Type': type === 'file' ? 'application/octet-stream' : 'application/x-directory',
          ...(mtime && mtimeToHeaders(mtime)),
          ...(mode && modeToHeaders(mode))
        }
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
      abortController.abort(err)
    }
  }

  const encoder = new FormDataEncoder({ boundary })
  const data = encoder.encode(parts(source, abortController))
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

module.exports = multipartRequest
