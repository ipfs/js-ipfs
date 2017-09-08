/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('block', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('put', () => {
    return ipfs('block put test/test-data/hello').then((out) => {
      expect(out).to.eql('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp\n')
    })
  })

  it('put with flags, format and mhtype', () => {
    return ipfs('block put --format eth-block --mhtype keccak-256 test/test-data/eth-block')
      .then((out) =>
        expect(out).to.eql('z43AaGF23fmvRnDP56Ub9WcJCfzSfqtmzNCCvmz5eudT8dtdCDS\n'))
  })

  it('get', () => {
    return ipfs('block get QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      .then((out) => expect(out).to.eql('hello world\n'))
  })

  it('get block from file without a final newline', () => {
    return ipfs('block put test/test-data/no-newline').then((out) => {
      expect(out).to.eql('QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL\n')
      return ipfs('block get QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL')
    })
      .then((out) => expect(out).to.eql('there is no newline at end of this file'))
  })

  it('stat', () => {
    return ipfs('block stat QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      .then((out) => {
        expect(out).to.eql([
          'Key: QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp',
          'Size: 12'
        ].join('\n') + '\n')
      })
  })

  it.skip('rm', () => {
    return ipfs('block rm QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      .then((out) => {
        expect(out).to.eql(
          'removed QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp\n'
        )
      })
  })
}))
