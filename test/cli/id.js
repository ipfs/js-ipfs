/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('id', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('get the id', () => {
    return ipfs('id').then((res) => {
      const id = JSON.parse(res)
      expect(id).to.have.property('id')
      expect(id).to.have.property('publicKey')
      expect(id).to.have.property('addresses')
    })
  })
}))
