/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const runOnAndOff = require('../utils/on-and-off')

const commandCount = 98
describe('commands', () => runOnAndOff((thing) => {
  let ipfs

  before(function () {
    this.timeout(30 * 1000)
    ipfs = thing.ipfs
  })

  it('list the commands', async () => {
    const out = await ipfs('commands')
    expect(out.split('\n')).to.have.length(commandCount)
  })
}))
