'use strict'

module.exports = {
  bundlesize: { maxSize: '89kB' },
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
        return {
          env: {
            IPFS_WORKER_URL: `/base/dist/worker.bundle.js`,
            ECHO_SERVER: `http://localhost:8080`
          }
        }
      }
    }
  }
}
