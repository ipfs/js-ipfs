'use strict'

const createServer = require('ipfsd-ctl').createServer

const server = createServer()

module.exports = {
  bundlesize: { maxSize: '237kB' },
  webpack: {
    resolve: {
      mainFields: ['browser', 'main']
    }
  },
  karma: {
    files: [{
      pattern: 'node_modules/interface-ipfs-core/test/fixtures/**/*',
      watched: false,
      served: true,
      included: false
    }],
    browserNoActivityTimeout: 210 * 1000,
    singleRun: true
  },
  hooks: {
    browser: {
      pre: () => server.start(),
      post: () => server.stop()
    }
  }
}
