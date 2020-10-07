'use strict'

// Import browser version otherwise electron-renderer will end up with node
// version and fail.
const normaliseInput = require('ipfs-core-utils/src/files/normalise-input/index.browser')
const modeToString = require('./mode-to-string')
const mtimeToObject = require('./mtime-to-object')
const { File, FormData } = require('ipfs-utils/src/globalthis')

async function multipartRequest (source = '', abortController, headers = {}) {
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

    if (mtime != null) {
      const {
        secs, nsecs
      } = mtimeToObject(mtime)

      qs.push(`mtime=${secs}`)

      if (nsecs != null) {
        qs.push(`mtime-nsecs=${nsecs}`)
      }
    }

    if (qs.length) {
      fieldName = `${fieldName}?${qs.join('&')}`
    }

    if (content) {
      formData.set(fieldName, content, encodeURIComponent(path))
      total += content.size
    } else {
      formData.set(fieldName, new File([''], encodeURIComponent(path), { type: 'application/x-directory' }))
    }

    index++
  }

  return {
    lengthComputable: true,
    total,
    headers,
    body: formData
  }
}

module.exports = multipartRequest
