/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const isNode = require('detect-node')

const factory = require('../utils/factory')

// TODO: unskip when DHT is enabled: https://github.com/ipfs/js-ipfs/pull/1994
describe.skip('dht', () => {
  describe('enabled', () => {
    const df = factory()
    let ipfsd, ipfs

    before(async function () {
      this.timeout(30 * 1000)

      ipfsd = await df.spawn()
      ipfs = ipfsd.api
    })

    after(() => df.clean())

    describe('findprovs', () => {
      it('should callback with error for invalid CID input', (done) => {
        ipfs.dht.findProvs('INVALID CID', (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_INVALID_CID')
          done()
        })
      })
    })
  })

  describe('disabled in browser', () => {
    if (isNode) { return }
    const df = factory()
    let ipfsd, ipfs

    before(async function (done) {
      this.timeout(30 * 1000)

      ipfsd = await df.spawn()
      ipfs = ipfsd.api
    })

    after(() => {
      if (ipfsd) {
        return ipfsd.stop()
      }
    })

    describe('put', () => {
      it('should error when DHT not available', async () => {
        await expect(ipfs.dht.put(Buffer.from('a'), Buffer.from('b')))
          .to.eventually.be.rejected()
          .and.to.have.property('code', 'ERR_DHT_DISABLED')
      })
    })
  })
})
