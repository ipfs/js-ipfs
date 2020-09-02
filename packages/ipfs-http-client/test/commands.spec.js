/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const f = require('./utils/factory')()

describe('.commands', function () {
  this.timeout(60 * 1000)

  let ipfs

  before(async () => {
    ipfs = (await f.spawn()).api
  })

  after(() => f.clean())

  it('lists commands', async () => {
    const res = await ipfs.commands()

    expect(res).to.exist()
  })
})
