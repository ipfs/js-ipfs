'use strict'

const path = require('path')
const isNode = require('detect-node')

if (isNode) {
  module.exports = path.join(__dirname, '../repo-tests-run')
} else {
  module.exports = 'ipfs'
}
