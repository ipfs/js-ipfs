/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const all = require('it-all')
const f = require('./utils/factory')

describe('stats', function () {
  this.timeout(50 * 1000) // slow CI

  let ipfs

  before(async () => {
    ipfs = (await f.spawn()).api
  })

  after(() => f.clean())

  it('.stats.bitswap', async () => {
    const res = await ipfs.stats.bitswap()

    expect(res).to.exist()
    expect(res).to.have.a.property('provideBufLen')
    expect(res).to.have.a.property('wantlist')
    expect(res).to.have.a.property('peers')
    expect(res).to.have.a.property('blocksReceived')
    expect(res).to.have.a.property('dataReceived')
    expect(res).to.have.a.property('blocksSent')
    expect(res).to.have.a.property('dataSent')
    expect(res).to.have.a.property('dupBlksReceived')
    expect(res).to.have.a.property('dupDataReceived')
  })

  it('.stats.bw', async () => {
    const res = (await all(ipfs.stats.bw()))[0]

    expect(res).to.exist()
    expect(res).to.have.a.property('totalIn')
    expect(res).to.have.a.property('totalOut')
    expect(res).to.have.a.property('rateIn')
    expect(res).to.have.a.property('rateOut')
  })

  it('.stats.repo', async () => {
    const res = await ipfs.stats.repo()

    expect(res).to.exist()
    expect(res).to.have.a.property('numObjects')
    expect(res).to.have.a.property('repoSize')
    expect(res).to.have.a.property('repoPath')
    expect(res).to.have.a.property('version')
    expect(res).to.have.a.property('storageMax')
  })
})
