/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('general cli options', () => runOnAndOff.off((thing) => {
  it('should handle --silent flag', () => {
    return thing.ipfs('help --silent').then((out) => {
      expect(out).to.be.empty()
    })
  })
}))
