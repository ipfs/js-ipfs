/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const isNode = require('detect-node')

const IPFSFactory = require('ipfsd-ctl')
const IPFS = require('../../src/core')

// TODO: unskip when DHT is enabled: https://github.com/ipfs/js-ipfs/pull/1994
describe.skip('dht', () => {
  describe('enabled', () => {
    let ipfsd, ipfs

    before(async function () {
      this.timeout(30 * 1000)

      const factory = IPFSFactory.create({
        type: 'proc',
        IpfsClient: require('ipfs-http-client')
      })

      ipfsd = await factory.spawn({
        exec: IPFS,
        initOptions: { bits: 512 },
        config: { Bootstrap: [] },
        preload: { enabled: false }
      })
      ipfs = ipfsd.api
    })

    after(() => {
      if (ipfsd) {
        return ipfsd.stop()
      }
    })

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

    let ipfsd, ipfs

    before(async function (done) {
      this.timeout(30 * 1000)

      const factory = IPFSFactory.create({ type: 'proc' })

      ipfsd = await factory.spawn({
        exec: IPFS,
        initOptions: { bits: 512 },
        config: {
          Bootstrap: []
        }
      })
      ipfs = ipfsd.api
    })

    after(() => {
      if (ipfsd) {
        return ipfsd.stop()
      }
    })

    describe('put', () => {
      it('should error when DHT not available', async () => {
        await ipfs.dht.put(Buffer.from('a'), Buffer.from('b')).then(
          () => expect.fail('Should have thrown'),
          (err) => expect(err.code).to.equal('ERR_DHT_DISABLED')
        )
      })
    })
  })
})
