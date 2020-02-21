'use strict'

const FormData = require('form-data')
const { isElectronRenderer } = require('ipfs-utils/src/env')

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

// TODO remove this when upstream fix for ky-universal is merged
// https://github.com/sindresorhus/ky-universal/issues/9
// also this should only be necessary when nodeIntegration is false in electron renderer
if (isElectronRenderer) {
  module.exports = require('./buffer-to-form-data.browser')
}
