'use strict'

const createServer = require('ipfsd-ctl').createServer

const server = createServer()

module.exports = {
  bundlesize: { maxSize: '231kB' },
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
    pre: server.start.bind(server),
    post: server.stop.bind(server)
  }
}
