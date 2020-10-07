'use strict'

// In electron-renderer we use native fetch and should encode content using
// native Blobs.
if (typeof Blob === 'function') {
  module.exports = require('./normalise-content.browser')
} else {
  module.exports = require('./normalise-content.node')
}
