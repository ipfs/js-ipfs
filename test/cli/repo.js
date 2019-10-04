/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const repoVersion = require('ipfs-repo').repoVersion
const runOnAndOff = require('../utils/on-and-off')

describe('repo', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('get the repo version', async () => {
    const out = await ipfs('repo version')
    expect(out).to.eql(`${repoVersion}\n`)
  })
}))
