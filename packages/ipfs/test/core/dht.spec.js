/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { isNode } = require('ipfs-utils/src/env')
const factory = require('../utils/factory')
const { Buffer } = require('buffer')

describe('dht', () => {
  describe('enabled by config', () => {
    const df = factory()
    let ipfsd, ipfs

    before(async function () {
      this.timeout(30 * 1000)

      ipfsd = await df.spawn({
        ipfsOptions: {
          libp2p: {
            config: {
              dht: {
                enabled: true
              }
            }
          }
        }
      })
      ipfs = ipfsd.api
    })

    after(() => df.clean())

    describe('put', () => {
      it('should put a value when enabled', async () => {
        await expect(ipfs.dht.put(Buffer.from('a'), Buffer.from('b')))
          .to.eventually.be.undefined()
      })
    })

    // TODO: unskip when DHT works: https://github.com/ipfs/js-ipfs/pull/1994
    describe.skip('findprovs', () => {
      it('should callback with error for invalid CID input', (done) => {
        ipfs.dht.findProvs('INVALID CID', (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_INVALID_CID')
          done()
        })
      })
    })
  })

  describe('disabled by config', () => {
    const df = factory()
    let ipfsd, ipfs

    before(async function () {
      this.timeout(30 * 1000)

      ipfsd = await df.spawn({
        ipfsOptions: {
          libp2p: {
            config: {
              dht: {
                enabled: false
              }
            }
          }
        }
      })
      ipfs = ipfsd.api
    })

    after(() => df.clean())

    describe('put', () => {
      it('should error when DHT not available', async () => {
        await expect(ipfs.dht.put(Buffer.from('a'), Buffer.from('b')))
          .to.eventually.be.rejected()
          .and.to.have.property('code', 'ERR_NOT_ENABLED')
      })
    })
  })

  describe('disabled in browser', () => {
    if (isNode) { return }
    const df = factory()
    let ipfsd, ipfs

    before(async function () {
      this.timeout(30 * 1000)

      ipfsd = await df.spawn()
      ipfs = ipfsd.api
    })

    after(() => df.clean())

    describe('put', () => {
      it('should error when DHT not available', async () => {
        await expect(ipfs.dht.put(Buffer.from('a'), Buffer.from('b')))
          .to.eventually.be.rejected()
          .and.to.have.property('code', 'ERR_NOT_ENABLED')
      })
    })
  })
})
