'use strict'

const FormData = require('form-data')

// TODO form data append doesnt have header option

/**
 * @param {Uint8Array} buf
 * @param {Object} [options]
 * @param {number|string} [options.mode]
 * @param {number|string} [options.mtime]
 * @param {number|string} [options.mtimeNsecs]
 */
module.exports = (buf, { mode, mtime, mtimeNsecs } = {}) => {
  const headers = {}

  if (mode != null) {
    headers.mode = mode
  }

  if (mtime != null) {
    headers.mtime = mtime

    if (mtimeNsecs != null) {
      headers['mtime-nsecs'] = mtimeNsecs
    }
  }

  const formData = new FormData()
  formData.append('file', buf, {
    header: headers
  })
  return formData
}
