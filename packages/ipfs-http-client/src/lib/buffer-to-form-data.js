'use strict'

const FormData = require('form-data')

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
