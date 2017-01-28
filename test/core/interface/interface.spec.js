/* eslint-env mocha */

'use strict'

const isNode = require('detect-node')

describe('interface-ipfs-core tests', () => {
  require('./block')
  require('./config')
  require('./files')
  require('./generic')
  require('./object')
  if (isNode) {
    require('./swarm')
    require('./pubsub')
  }
})
