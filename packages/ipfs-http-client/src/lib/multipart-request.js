'use strict'

// In electron-renderer we use native fetch and should encode body using native
// form data.
if (typeof fetch === 'function') {
  module.exports = require('./multipart-request.browser')
} else {
  module.exports = require('./multipart-request.node')
}
