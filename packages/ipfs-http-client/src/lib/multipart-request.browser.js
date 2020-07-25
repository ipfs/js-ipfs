'use strict'

const normaliseInput = require('ipfs-core-utils/src/files/normalise-input')
const modeToString = require('./mode-to-string')
const mtimeToObject = require('./mtime-to-object')
const { File, FormData } = require('ipfs-utils/src/globalthis')

async function multipartRequest (source = '', abortController, headers = {}) {
  const formData = new FormData()
  let index = 0

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
    } else {
      formData.set(fieldName, new File([''], encodeURIComponent(path), { type: 'application/x-directory' }))
    }

    index++
  }

  return {
    headers,
    body: formData
  }
}

module.exports = multipartRequest
