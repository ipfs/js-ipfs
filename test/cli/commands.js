/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

const commandCount = 77

module.exports = (thing) => describe('commands', () => {
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
})
