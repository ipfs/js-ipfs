'use strict'

const { isElectronRenderer } = require('ipfs-utils/src/env')
const FormData = require('form-data')

// TODO form data append doesnt have header option

// @ts-ignore
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

if (isElectronRenderer) {
  module.exports = require('./buffer-to-form-data.browser')
}