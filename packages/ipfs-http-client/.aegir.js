'use strict'

const { createServer } = require('ipfsd-ctl')
const EchoServer = require('aegir/utils/echo-server')


const server = createServer({
  host: '127.0.0.1',
  port: 48372
}, {
  type: 'go',
  ipfsHttpModule: require('./'),
  ipfsBin: require('go-ipfs-dep').path()
})

let echoServer = new EchoServer()

module.exports = {
  bundlesize: { maxSize: '89kB' },
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
        await echoServer.start()
        return {
          env: {
            ECHO_SERVER: `http://${echoServer.host}:${echoServer.port}`
          }
        }
      },
      post: () => echoServer.stop()
    },
    browser: {
      pre: async () => {

        await  Promise.all([
          server.start(),
          echoServer.start()
        ])
        return {
          env: {
            ECHO_SERVER: `http://${echoServer.host}:${echoServer.port}`
          }
        }
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
