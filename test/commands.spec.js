/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const ipfsClient = require('../src')
const f = require('./utils/factory')

describe('.commands', function () {
  this.timeout(60 * 1000)

  let ipfsd
  let ipfs

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

  it('lists commands', async () => {
    const res = await ipfs.commands()

    expect(res).to.exist()
  })
})
