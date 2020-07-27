'use strict'

const EchoServer = require('aegir/utils/echo-server')
const echoServer = new EchoServer()

module.exports = {
  bundlesize: { maxSize: '80kB' },
  karma: {
    files: [
      {
        pattern: 'node_modules/interface-ipfs-core/test/fixtures/**/*',
        watched: false,
        served: true,
        included: false
      },
      {
        pattern: 'dist/**/*',
        watched: true,
        served: true,
        included: false
      }
    ],
    browserNoActivityTimeout: 210 * 1000,
    singleRun: true,
    captureConsole: true,
    logLevel: 'LOG_DEBUG',
    mocha: {
      bail: true
    }
  },
  hooks: {
    browser: {
      pre: async () => {
        await echoServer.start()

        return {
          env: {
            IPFS_WORKER_URL: `/base/dist/worker.bundle.js`,
            ECHO_SERVER: `http://${echoServer.host}:${echoServer.port}`
          }
        }
      },
      post: async () => {
        await echoServer.stop()
      }
    }
  }
}
