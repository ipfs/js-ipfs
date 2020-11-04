'use strict'

const { isElectronRenderer } = require('wherearewe')

// In electron-renderer we use the browser transport
if (isElectronRenderer) {
  module.exports = require('./transport.browser')
} else {
  module.exports = require('./transport.node')
}
