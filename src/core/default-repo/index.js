'use strict'

const isNode = require('detect-node')

module.exports = isNode
  ? require('./node')
  : require('./browser')
