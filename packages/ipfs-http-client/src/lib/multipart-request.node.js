'use strict'

const normaliseInput = require('ipfs-core-utils/src/files/normalise-input')
const { nanoid } = require('nanoid')
const modeToString = require('./mode-to-string')
const merge = require('merge-options').bind({ ignoreUndefined: true })
const toStream = require('it-to-stream')

/**
 *
 * @param {Object} source
 * @param {AbortController} abortController
 * @param {Headers|Record<string, string>} [headers]
 * @param {string} [boundary]
 */
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

        let fieldName = type + fileSuffix
        const qs = []

        if (mode !== null && mode !== undefined) {
          qs.push(`mode=${modeToString(mode)}`)
        }

        if (mtime != null) {
          const { secs, nsecs } = mtime

          qs.push(`mtime=${secs}`)

          if (nsecs != null) {
            qs.push(`mtime-nsecs=${nsecs}`)
          }
        }

        if (qs.length) {
          fieldName = `${fieldName}?${qs.join('&')}`
        }

        yield `--${boundary}\r\n`
        yield `Content-Disposition: form-data; name="${fieldName}"; filename="${encodeURIComponent(path)}"\r\n`
        yield `Content-Type: ${content ? 'application/octet-stream' : 'application/x-directory'}\r\n`
        yield '\r\n'

        if (content) {
          yield * content
        }

        index++
      }
    } catch (err) {
      // workaround for https://github.com/node-fetch/node-fetch/issues/753
      // @ts-ignore - abort does not expect an arguments
      abortController.abort(err)
    } finally {
      yield `\r\n--${boundary}--\r\n`
    }
  }

  return {
    parts: null,
    total: -1,
    headers: merge(headers, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    }),
    body: await toStream(streamFiles(source))
  }
}

module.exports = multipartRequest
