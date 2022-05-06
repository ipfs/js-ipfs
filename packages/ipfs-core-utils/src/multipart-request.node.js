import { normaliseInput } from './files/normalise-input-multiple.js'
import { nanoid } from 'nanoid'
import { modeToString } from './mode-to-string.js'
import mergeOpts from 'merge-options'
// @ts-expect-error no types
import toStream from 'it-to-stream'
import { logger } from '@libp2p/logger'
import itPeekable from 'it-peekable'

const merge = mergeOpts.bind({ ignoreUndefined: true })
const log = logger('ipfs:core-utils:multipart-request')

/**
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidateStream} ImportCandidateStream
 */

/**
 * @param {ImportCandidateStream} source
 * @param {AbortController} abortController
 * @param {Headers|Record<string, string>} [headers]
 * @param {string} [boundary]
 */
export async function multipartRequest (source, abortController, headers = {}, boundary = `-----------------------------${nanoid()}`) {
  /**
   * @param {ImportCandidateStream} source
   */
  async function * streamFiles (source) {
    try {
      let index = 0

      // @ts-expect-error
      for await (const { content, path, mode, mtime } of source) {
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
        yield `Content-Disposition: form-data; name="${fieldName}"; filename="${encodeURIComponent(path || '')}"\r\n`
        yield `Content-Type: ${content ? 'application/octet-stream' : 'application/x-directory'}\r\n`
        yield '\r\n'

        if (content) {
          yield * content
        }

        index++
      }
    } catch (/** @type {any} */ err) {
      log(err)
      // workaround for https://github.com/node-fetch/node-fetch/issues/753
      abortController.abort()
    } finally {
      yield `\r\n--${boundary}--\r\n`
    }
  }

  // peek at the first value in order to get the input stream moving
  // and to validate its contents.
  // We cannot do this in the `for await..of` in streamFiles due to
  // https://github.com/node-fetch/node-fetch/issues/753
  const peekable = itPeekable(normaliseInput(source))

  /** @type {any} value **/
  const { value, done } = await peekable.peek()

  if (!done) {
    peekable.push(value)
  }

  return {
    parts: null,
    total: -1,
    headers: merge(headers, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    }),
    // @ts-expect-error normaliseInput returns unixfs importer import candidates
    body: toStream(streamFiles(peekable))
  }
}
