'use strict'

const createServer = require('ipfsd-ctl').createServer

const server = createServer()
module.exports = {
  karma: {
    files: [{
      pattern: 'node_modules/interface-ipfs-core/test/fixtures/**/*',
      watched: false,
      served: true,
      included: false
    }],
    browserNoActivityTimeout: 100 * 1000,
    singleRun: true
  },
  hooks: {
    pre: server.start.bind(server),
    post: server.stop.bind(server)
  }
}
