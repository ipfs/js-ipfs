'use strict'
const { isElectronRenderer } = require('ipfs-utils/src/env')

// In electron-renderer we use native fetch and should encode body using native
// form data.
if (isElectronRenderer) {
  module.exports = require('./multipart-request.browser')
} else {
  module.exports = require('./multipart-request.node')
}
