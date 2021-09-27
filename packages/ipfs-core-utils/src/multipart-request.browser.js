
// Import browser version otherwise electron-renderer will end up with node
// version and fail.
import { normaliseInput } from './files/normalise-input-multiple.browser.js'
import { modeToString } from './mode-to-string.js'

/**
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidateStream} ImportCandidateStream
 */

/**
 * @param {ImportCandidateStream} source
 * @param {AbortController} abortController
 * @param {Headers|Record<string, string>} [headers]
 */
export async function multipartRequest (source, abortController, headers = {}) {
  const parts = []
  const formData = new FormData()
  let index = 0
  let total = 0

  for await (const { content, path, mode, mtime } of normaliseInput(source)) {
    let fileSuffix = ''
    const type = content ? 'file' : 'dir'

    if (index > 0) {
      fileSuffix = `-${index}`
    }

    let fieldName = type + fileSuffix
    const qs = []

    if (mode !== null && mode !== undefined) {
      qs.push(`mode=${modeToString(mode)}`)
    }

    if ((mtime) != null) {
      const { secs, nsecs } = (mtime)

      qs.push(`mtime=${secs}`)

      if (nsecs != null) {
        qs.push(`mtime-nsecs=${nsecs}`)
      }
    }

    if (qs.length) {
      fieldName = `${fieldName}?${qs.join('&')}`
    }

    if (content) {
      formData.set(fieldName, content, path != null ? encodeURIComponent(path) : undefined)
      const end = total + content.size
      parts.push({ name: path, start: total, end })
      total = end
    } else if (path != null) {
      formData.set(fieldName, new File([''], encodeURIComponent(path), { type: 'application/x-directory' }))
    } else {
      throw new Error('path or content or both must be set')
    }

    index++
  }

  return {
    total,
    parts,
    headers,
    body: formData
  }
}
