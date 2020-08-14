'use strict'

module.exports = {
  bundlesize: { maxSize: '140kB' },
  webpack: {
    node: {
      // needed by the mime-types module
      path: true,
      // needed by readable-web-to-node-stream module used by file-type
      stream: true
    }
  }
}
