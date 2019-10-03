/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const ipfsClient = require('../src')
const f = require('./utils/factory')

describe('.repo', function () {
  this.timeout(50 * 1000) // slow CI

  let ipfs
  let ipfsd

  before(async () => {
    ipfsd = await f.spawn({
      initOptions: {
        bits: 1024,
        profile: 'test'
      }
    })
    ipfs = ipfsClient(ipfsd.apiAddr)
  })

  after(async () => {
    if (ipfsd) {
      await ipfsd.stop()
    }
  })

  it('.repo.gc', async () => {
    const res = await ipfs.repo.gc()

    expect(res).to.exist()
  })

  it('.repo.stat', async () => {
    const res = await ipfs.repo.stat()

    expect(res).to.exist()
    expect(res).to.have.a.property('numObjects')
    expect(res).to.have.a.property('repoSize')
  })

  it('.repo.version', async () => {
    const res = await ipfs.repo.version()

    expect(res).to.exist()
  })
})
