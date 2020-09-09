'use strict'

const { isNode } = require('ipfs-utils/src/env')

if (isNode) {
  require('./routes')
}

require('./cors')
require('./interface')
