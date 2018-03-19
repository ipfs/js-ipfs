/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

const commandCount = 77
describe('commands', () => runOnAndOff((thing) => {
  let ipfs

  before(function () {
    this.timeout(30 * 1000)
    ipfs = thing.ipfs
  })

  it('list the commands', () => {
    return ipfs('commands').then((out) => {
      expect(out.split('\n')).to.have.length(commandCount + 1)
    })
  })
}))
