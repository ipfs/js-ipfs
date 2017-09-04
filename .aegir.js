'use strict'

const factory = require('./test/ipfs-factory/tasks')

module.exports = {
  karma: {
    files: [{
      pattern: 'node_modules/interface-ipfs-core/test/fixtures/**/*',
      watched: false,
      served: true,
      included: false
    }]
  },
  hooks: {
    pre: factory.start,
    post: factory.stop
  }
}
