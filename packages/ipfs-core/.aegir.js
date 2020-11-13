'use strict'

module.exports = {
  bundlesize: { maxSize: '523kB' },
  webpack: {
    node: {
      // required by the nofilter module
      stream: true,

      // required by the core-util-is module
      Buffer: true
    }
  }
}
