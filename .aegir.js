'use strict'

const createServer = require('ipfsd-ctl').createServer
const EchoServer = require('interface-ipfs-core/src/utils/echo-http-server')
const server = createServer()
const echoServer = EchoServer.createServer()

module.exports = {
  bundlesize: { maxSize: '246kB' },
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
    node: {
      pre: () => echoServer.start(),
      post: () => echoServer.stop()
    },
    browser: {
      pre: () => {
        return Promise.all([
          server.start(),
          echoServer.start()
        ])
      },
      post: () => {
        return Promise.all([
          server.stop(),
          echoServer.stop()
        ])
      }
    }
  }
}
