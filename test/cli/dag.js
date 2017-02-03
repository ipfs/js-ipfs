/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('dag', () => runOnAndOff.off((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('get', () => {
    // put test eth-block
    return ipfs('block put --format eth-block --mhtype keccak-256 test/test-data/eth-block').then((out) => {
      expect(out).to.eql('z43AaGF23fmvRnDP56Ub9WcJCfzSfqtmzNCCvmz5eudT8dtdCDS')
      // lookup path on eth-block
      return ipfs('dag get z43AaGF23fmvRnDP56Ub9WcJCfzSfqtmzNCCvmz5eudT8dtdCDS/parentHash')
    }).then((out) => {
      let expectHash = new Buffer('c8c0a17305adea9bbb4b98a52d44f0c1478f5c48fc4b64739ee805242501b256', 'hex')
      expect(out).to.be.eql('0x' + expectHash.toString('hex'))
    })
  })
}))
