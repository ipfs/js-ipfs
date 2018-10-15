/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (thing) => describe('id', () => {
  let ipfs

  before(function () {
    this.timeout(60 * 1000)
    ipfs = thing.ipfs
  })

  it('get the id', function () {
    this.timeout(60 * 1000)

    return ipfs('id').then((res) => {
      const id = JSON.parse(res)
      expect(id).to.have.property('id')
      expect(id).to.have.property('publicKey')
      expect(id).to.have.property('addresses')
    })
  })
})
