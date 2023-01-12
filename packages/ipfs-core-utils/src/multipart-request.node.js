import { normaliseInput } from './files/normalise-input-multiple.js'
import { nanoid } from 'nanoid'
import { modeToString } from './mode-to-string.js'
import mergeOpts from 'merge-options'
// @ts-expect-error no types
import toStream from 'it-to-stream'
import { logger } from '@libp2p/logger'

const merge = mergeOpts.bind({ ignoreUndefined: true })
const log = logger('ipfs:core-utils:multipart-request')

/**
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidateStream} ImportCandidateStream
 */

/**
 * @param {ImportCandidateStream} source
 * @param {Headers|Record<string, string>} [headers]
 * @param {string} [boundary]
 */
export async function multipartRequest (source, headers = {}, boundary = `-----------------------------${nanoid()}`) {
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
    } catch (e) {
      log(e)
      throw e
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
    // @ts-expect-error normaliseInput returns unixfs importer import candidates
    body: toStream(streamFiles(normaliseInput(source)))
  }
}
