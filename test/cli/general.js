/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('general cli options', () => runOnAndOff((thing) => {
  it('should handle --quiet flag', () => {
    return thing.ipfs('help --quiet').then((out) => {
      expect(out).to.be.empty()
    })
  })
}))
