/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const repoVersion = require('ipfs-repo').repoVersion
const runOnAndOff = require('../utils/on-and-off')

describe('repo', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('get the repo version', () => {
    return ipfs('repo version').then((out) => {
      expect(out).to.eql(`${repoVersion}\n`)
    })
  })
}))
