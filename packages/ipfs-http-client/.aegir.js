'use strict'

const createServer = require('ipfsd-ctl').createServer
const EchoServer = require('interface-ipfs-core/src/utils/echo-http-server')
const server = createServer({
  host: '127.0.0.1',
  port: 48372
}, {
  type: 'go',
  ipfsHttpModule: require('./'),
  ipfsBin: require('go-ipfs-dep').path()
})
let echoServer
const webpack = require('webpack')

module.exports = {
  bundlesize: { maxSize: '89kB' },
  webpack: {
    resolve: {
      mainFields: ['browser', 'main']
    },
    ...(process.env.NODE_ENV === 'test' ? {
      plugins: [
        new webpack.EnvironmentPlugin(['DEBUG', 'ECHO_SERVER_PORT'])
      ]
    } : {})
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
      pre: async () => {
        if (process.env.ECHO_SERVER_PORT) {
          echoServer = EchoServer.createServer()

          await echoServer.start()
        }
      },
      post: async () => {
        if (echoServer) {
          await echoServer.stop()
        }
      }
    },
    browser: {
      pre: () => {
        echoServer = EchoServer.createServer()

        return Promise.all([
          server.start(),
          echoServer ? echoServer.start() : Promise.resolve()
        ])
      },
      post: () => {
        return Promise.all([
          server.stop(),
          echoServer ? echoServer.stop() : Promise.resolve()
        ])
      }
    }
  }
}
