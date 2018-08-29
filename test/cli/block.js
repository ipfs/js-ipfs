/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('block', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('put', function () {
    this.timeout(40 * 1000)
    return ipfs('block put test/fixtures/test-data/hello').then((out) => {
      expect(out).to.eql('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp\n')
    })
  })

  it('put with flags, format and mhtype', function () {
    this.timeout(40 * 1000)

    return ipfs('block put --format eth-block --mhtype keccak-256 test/fixtures/test-data/eth-block')
      .then((out) =>
        expect(out).to.eql('z43AaGF23fmvRnDP56Ub9WcJCfzSfqtmzNCCvmz5eudT8dtdCDS\n'))
  })

  it('should put and print CID encoded in specified base', function () {
    this.timeout(40 * 1000)

    return ipfs('block put test/fixtures/test-data/hello --cid-base=base64').then((out) => {
      expect(out).to.eql('mAXASIKlIkE8vD0ebj4GXaUswGEsNLtHBzSoewPuF0pmhkqRH\n')
    })
  })

  it('get', function () {
    this.timeout(40 * 1000)

    return ipfs('block get QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      .then((out) => expect(out).to.eql('hello world\n'))
  })

  it('get block from file without a final newline', function () {
    this.timeout(40 * 1000)

    return ipfs('block put test/fixtures/test-data/no-newline').then((out) => {
      expect(out).to.eql('QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL\n')
      return ipfs('block get QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL')
    })
      .then((out) => expect(out).to.eql('there is no newline at end of this file'))
  })

  it('stat', function () {
    this.timeout(40 * 1000)

    return ipfs('block stat QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      .then((out) => {
        expect(out).to.eql([
          'Key: QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp',
          'Size: 12'
        ].join('\n') + '\n')
      })
  })

  it('should stat and print CID encoded in specified base', function () {
    this.timeout(80 * 1000)

    return ipfs('block put test/fixtures/test-data/hello')
      .then((out) => {
        expect(out).to.eql('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp\n')
        return ipfs('block stat QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp --cid-base=base64')
      })
      .then((out) => {
        expect(out).to.eql([
          'Key: mAXASIKlIkE8vD0ebj4GXaUswGEsNLtHBzSoewPuF0pmhkqRH',
          'Size: 12'
        ].join('\n') + '\n')
      })
  })

  it.skip('rm', function () {
    this.timeout(40 * 1000)

    return ipfs('block rm QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
      .then((out) => {
        expect(out).to.eql(
          'removed QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp\n'
        )
      })
  })
}))
