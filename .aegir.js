'use strict'

const IPFSFactory = require('ipfsd-ctl')
const parallel = require('async/parallel')
const MockPreloadNode = require('./test/utils/mock-preload-node')
const EchoHttpServer = require('interface-ipfs-core/src/utils/echo-http-server')

const ipfsdServer = IPFSFactory.createServer()
const preloadNode = MockPreloadNode.createNode()
const httpEchoServer = EchoHttpServer.createServer() // used by addFromURL

const batch = (call, done, ...srvs) => parallel(srvs.map(srv => cb => {
  if (srv === ipfsdServer) {
    srv[call]()
    cb()
  } else {
    srv[call](cb)
  }
}), done)

module.exports = {
  bundlesize: { maxSize: '692kB' },
  webpack: {
    resolve: {
      mainFields: ['browser', 'main'],
      aliasFields: ['browser', 'browser-all-ipld-formats'],
    }
  },
  karma: {
    files: [{
      pattern: 'node_modules/interface-ipfs-core/test/fixtures/**/*',
      watched: false,
      served: true,
      included: false
    }],
    browserNoActivityTimeout: 100 * 1000,
  },
  hooks: {
    node: {
      pre: (cb) => preloadNode.start(cb),
      post: (cb) => preloadNode.stop(cb)
    },
    browser: {
      pre: (cb) => batch('start', cb, ipfsdServer, preloadNode, httpEchoServer),
      post: (cb) => batch('stop', cb, ipfsdServer, preloadNode, httpEchoServer)
    }
  }
}
