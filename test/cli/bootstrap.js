/* eslint max-nested-callbacks: ['error', 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const runOnAndOff = require('../utils/on-and-off')

describe('bootstrap', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('rm all bootstrap nodes', async function () {
    this.timeout(40 * 1000)

    const outListBefore = await ipfs('bootstrap list')

    const outRm = await ipfs('bootstrap rm --all')
    expect(outRm).to.equal(outListBefore)

    const outListAfter = await ipfs('bootstrap list')
    expect(outListAfter).to.equal('')
  })
}))
