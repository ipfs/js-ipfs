// @ts-check
'use strict'

// Electron in  renderer process has native `Blob` but it would not pick up
// browser override. Therefor we do the runtime check and pick browser verison
// if native Blob is available and node polyfill otherwise.
if (typeof Blob === 'function') {
  module.exports = require('./blob.browser')
} else {
  module.exports = require('./blob.node')
}
