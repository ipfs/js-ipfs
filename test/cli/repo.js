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

  it('get repo stats', async () => {
    const stats = await ipfs('repo stat')
    expect(stats).to.match(/^\s+repo\ssize:\s+\d+$/gm)
    expect(stats).to.match(/^\s+maximum\sstorage:\s+\d+$/gm)
  })

  it('get human readable repo stats', async () => {
    const stats = await ipfs('repo stat --human')
    expect(stats).to.include('MB').and.include('GB')
  })
}))
