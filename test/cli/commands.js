/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

const commandCount = 78

module.exports = (thing) => describe('commands', () => {
  let ipfs

  before(function () {
    this.timeout(30 * 1000)
    ipfs = thing.ipfs
  })

  it('list the commands', () => {
    console.log('NOTE: This command shows a `YError` but its OK as arguments are missing on purpose')
    return ipfs('commands').then((out) => {
      expect(out.split('\n')).to.have.length(commandCount + 1)
    })
  })
})
