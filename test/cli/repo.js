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

  it('get repo stats', async () => {
    const stats = await ipfs('repo stat')
    expect(stats).to.match(/^NumObjects:\s\d+$/m)
    expect(stats).to.match(/^RepoSize:\s\d+$/m)
    expect(stats).to.match(/^StorageMax:\s\d+$/m)
    expect(stats).to.match(/^RepoPath:\s.+$/m)
    expect(stats).to.match(/^Version:\s\d+$/m)
  })

  it('get human readable repo stats', async () => {
    const stats = await ipfs('repo stat --human')
    expect(stats).to.match(/^NumObjects:\s\d+$/m)
    expect(stats).to.match(/^RepoSize:\s+[\d.]+\s[PTGMK]?B$/gm)
    expect(stats).to.match(/^StorageMax:\s+[\d.]+\s[PTGMK]?B$/gm)
    expect(stats).to.match(/^RepoPath:\s.+$/m)
    expect(stats).to.match(/^Version:\s\d+$/m)
  })

  it('get the repo version', async () => {
    const out = await ipfs('repo version')
    expect(out).to.eql(`${repoVersion}\n`)
  })
}))
