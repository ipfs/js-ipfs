'use strict'

const normaliseInput = require('ipfs-core-utils/src/files/normalise-input')
const toStream = require('./to-stream')
const { nanoid } = require('nanoid')
const modeToString = require('../lib/mode-to-string')
const mtimeToObject = require('../lib/mtime-to-object')
const merge = require('merge-options').bind({ ignoreUndefined: true })

async function multipartRequest (source = '', abortController, headers = {}, boundary = `-----------------------------${nanoid()}`) {
  async function * streamFiles (source) {
    try {
      let index = 0

      for await (const { content, path, mode, mtime } of normaliseInput(source)) {
        let fileSuffix = ''
        const type = content ? 'file' : 'dir'

        if (index > 0) {
          yield '\r\n'

          fileSuffix = `-${index}`
        }

        yield `--${boundary}\r\n`
        yield `Content-Disposition: form-data; name="${type}${fileSuffix}"; filename="${encodeURIComponent(path)}"\r\n`
        yield `Content-Type: ${content ? 'application/octet-stream' : 'application/x-directory'}\r\n`

        if (mode !== null && mode !== undefined) {
          yield `mode: ${modeToString(mode)}\r\n`
        }

        if (mtime != null) {
          const {
            secs, nsecs
          } = mtimeToObject(mtime)

          yield `mtime: ${secs}\r\n`

          if (nsecs != null) {
            yield `mtime-nsecs: ${nsecs}\r\n`
          }
        }

        yield '\r\n'

        if (content) {
          yield * content
        }

        index++
      }
    } catch (err) {
      // workaround for https://github.com/node-fetch/node-fetch/issues/753
      abortController.abort(err)
    } finally {
      yield `\r\n--${boundary}--\r\n`
    }
  }

  return {
    headers: merge(headers, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    }),
    body: await toStream(streamFiles(source))
  }
}

module.exports = multipartRequest
