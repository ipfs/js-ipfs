'use strict'
const mergeOptions = require('merge-options')

module.exports = (blockService, options = {}) => {
  return mergeOptions({
    blockService: blockService
  }, options)
}
