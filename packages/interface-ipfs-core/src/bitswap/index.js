'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  stat: require('./stat'),
  wantlist: require('./wantlist'),
  wantlistForPeer: require('./wantlist-for-peer')
}

module.exports = createSuite(tests)
