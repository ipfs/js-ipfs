/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const f = require('./utils/factory')

describe('.repo', function () {
  this.timeout(50 * 1000) // slow CI

  let ipfs

  before(async () => {
    ipfs = (await f.spawn()).api
  })

  after(() => f.clean())

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
