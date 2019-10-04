/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const runOnAndOff = require('../utils/on-and-off')

describe('block', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('put', async function () {
    this.timeout(40 * 1000)

    const out = await ipfs('block put test/fixtures/test-data/hello')
    expect(out).to.eql('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp\n')
  })

  it('put with flags, format and mhtype', async function () {
    this.timeout(40 * 1000)

    const out = await ipfs('block put --format eth-block --mhtype keccak-256 test/fixtures/test-data/eth-block')
    expect(out).to.eql('bagiacgzarkhijr4xmbp345ovwwxra7kcecrnwcwtl7lg3g7d2ogyprdswjwq\n')
  })

  it('should put and print CID encoded in specified base', async function () {
    this.timeout(40 * 1000)

    const out = await ipfs('block put test/fixtures/test-data/hello --cid-base=base64')
    expect(out).to.eql('mAXASIKlIkE8vD0ebj4GXaUswGEsNLtHBzSoewPuF0pmhkqRH\n')
  })

  it('get', async function () {
    this.timeout(40 * 1000)

    const out = await ipfs('block get QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
    expect(out).to.eql('hello world\n')
  })

  it('get block from file without a final newline', async function () {
    this.timeout(40 * 1000)

    const out = await ipfs('block put test/fixtures/test-data/no-newline')
    expect(out).to.eql('QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL\n')

    const out2 = await ipfs('block get QmTwbQs4sGcCiPxV97SpbHS7QgmVg9SiKxcG1AcF1Ly2SL')
    expect(out2).to.eql('there is no newline at end of this file')
  })

  it('stat', async function () {
    this.timeout(40 * 1000)

    const out = await ipfs('block stat QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
    expect(out).to.eql([
      'Key: QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp',
      'Size: 12'
    ].join('\n') + '\n')
  })

  it('should stat and print CID encoded in specified base', async function () {
    this.timeout(80 * 1000)

    const out = await ipfs('block put test/fixtures/test-data/hello')
    expect(out).to.eql('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp\n')

    const out2 = await ipfs('block stat QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp --cid-base=base64')
    expect(out2).to.eql([
      'Key: mAXASIKlIkE8vD0ebj4GXaUswGEsNLtHBzSoewPuF0pmhkqRH',
      'Size: 12'
    ].join('\n') + '\n')
  })

  it.skip('rm', async function () {
    this.timeout(40 * 1000)

    const out = await ipfs('block rm QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
    expect(out).to.eql('removed QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp\n')
  })
}))
