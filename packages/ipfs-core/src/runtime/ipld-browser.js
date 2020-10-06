'use strict'
const mergeOptions = require('merge-options')
const ipldDagCbor = require('ipld-dag-cbor')
const ipldDagPb = require('ipld-dag-pb')
const ipldRaw = require('ipld-raw')

module.exports = (blockService, options) => {
  options = options || {}

  return mergeOptions.call(
    // ensure we have the defaults formats even if the user overrides `formats: []`
    { concatArrays: true },
    {
      blockService: blockService,
      formats: [ipldDagCbor, ipldDagPb, ipldRaw]
    }, options)
}
