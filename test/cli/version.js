/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const pkgversion = require('../../package.json').version
const runOnAndOff = require('../utils/on-and-off')

describe('version', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('get the version', () => {
    return ipfs('version').then((out) => {
      expect(out).to.be.eql(
        `js-ipfs version: ${pkgversion}`
      )
    })
  })
}))
