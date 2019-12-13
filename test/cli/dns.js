/* eslint-env mocha */
'use strict'

// const { expect } = require('interface-ipfs-core/src/utils/mocha')
const runOnAndOff = require('../utils/on-and-off')
// const isIPFS = require('is-ipfs')

describe('dns', () => runOnAndOff((thing) => {
  // let ipfs

  before(function () {
    this.timeout(60 * 1000)
    // ipfs = thing.ipfs
  })

  // TODO add smoke test plus maybe errors just to make sure this works
}))
