'use strict'

const FormData = require('form-data')
const { isElectronRenderer } = require('ipfs-utils/src/env')

module.exports = buf => {
  const formData = new FormData()
  formData.append('file', buf)
  return formData
}

// TODO remove this when upstream fix for ky-universal is merged
// https://github.com/sindresorhus/ky-universal/issues/9
// also this should only be necessary when nodeIntegration is false in electron renderer
if (isElectronRenderer) {
  module.exports = require('./buffer-to-form-data.browser')
}
