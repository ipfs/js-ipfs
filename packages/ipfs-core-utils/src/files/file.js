// @ts-check
'use strict'

// Electron in renderer process has native `File` but it would not pick up
// browser override. Therefor we do the runtime check and pick the browser
// verison if native `File` is available and node polyfill otherwise.
if (typeof File === 'function') {
  module.exports = require('./file.browser')
} else {
  module.exports = require('./file.node')
}
