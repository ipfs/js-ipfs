/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const { fixtures, clearPins, expectPinned, expectNotPinned, pinTypes } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const all = require('it-all')
const drain = require('it-drain')
const {
  DAGNode
} = require('ipld-dag-pb')
const testTimeout = require('../utils/test-timeout')
const CID = require('cids')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.add', function () {
    this.timeout(50 * 1000)

    let ipfs
    before(async () => {
      ipfs = (await common.spawn()).api

      await drain(
        ipfs.addAll(
          fixtures.files.map(file => ({ content: file.data })), {
            pin: false
          }
        )
      )

      await drain(
        ipfs.addAll(fixtures.directory.files.map(
          file => ({
            path: file.path,
            content: file.data
          })
        ), {
          pin: false
        })
      )
    })

    after(() => common.clean())

    beforeEach(() => {
      return clearPins(ipfs)
    })

    it('should add a CID and return the added CID', async () => {
      const cid = await ipfs.pin.add(fixtures.files[0].cid)
      expect(cid).to.deep.equal(fixtures.files[0].cid)
    })

    it('should add a pin with options and return the added CID', async () => {
      const cid = await ipfs.pin.add(fixtures.files[0].cid, {
        recursive: false
      })
      expect(cid).to.deep.equal(fixtures.files[0].cid)
    })

    it('should add recursively', async () => {
      await ipfs.pin.add(fixtures.directory.cid)
      await expectPinned(ipfs, fixtures.directory.cid, pinTypes.recursive)

      const pinChecks = Object.values(fixtures.directory.files).map(file => expectPinned(ipfs, file.cid))
      return Promise.all(pinChecks)
    })

    it('should add directly', async () => {
      await ipfs.pin.add(fixtures.directory.cid, {
        recursive: false
      })

      await expectPinned(ipfs, fixtures.directory.cid, pinTypes.direct)
      await expectNotPinned(ipfs, fixtures.directory.files[0].cid)
    })

    it('should recursively pin parent of direct pin', async () => {
      await ipfs.pin.add(fixtures.directory.files[0].cid, {
        recursive: false
      })
      await ipfs.pin.add(fixtures.directory.cid)

      // file is pinned both directly and indirectly o.O
      await expectPinned(ipfs, fixtures.directory.files[0].cid, pinTypes.direct)
      await expectPinned(ipfs, fixtures.directory.files[0].cid, pinTypes.indirect)
    })

    it('should fail to directly pin a recursive pin', async () => {
      await ipfs.pin.add(fixtures.directory.cid)
      return expect(ipfs.pin.add(fixtures.directory.cid, {
        recursive: false
      }))
        .to.eventually.be.rejected()
        .with(/already pinned recursively/)
    })

    it('should fail to pin a hash not in datastore', function () {
      this.slow(3 * 1000)
      this.timeout(5 * 1000)
      const falseHash = `${`${fixtures.directory.cid}`.slice(0, -2)}ss`
      return expect(ipfs.pin.add(falseHash, { timeout: '2s' }))
        .to.eventually.be.rejected()
        // TODO: http api TimeoutErrors do not have this property
        // .with.a.property('code').that.equals('ERR_TIMEOUT')
    })

    it('needs all children in datastore to pin recursively', async function () {
      this.slow(3 * 1000)
      this.timeout(5 * 1000)
      await all(ipfs.block.rm(fixtures.directory.files[0].cid))

      await expect(ipfs.pin.add(fixtures.directory.cid, { timeout: '2s' }))
        .to.eventually.be.rejected()
    })

    it('should pin dag-cbor', async () => {
      const cid = await ipfs.dag.put({}, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      })

      await ipfs.pin.add(cid)

      const pins = await all(ipfs.pin.ls())

      expect(pins).to.deep.include({
        type: 'recursive',
        cid
      })
    })

    it('should pin raw', async () => {
      const cid = await ipfs.dag.put(new Uint8Array(0), {
        format: 'raw',
        hashAlg: 'sha2-256'
      })

      await ipfs.pin.add(cid)

      const pins = await all(ipfs.pin.ls())

      expect(pins).to.deep.include({
        type: 'recursive',
        cid
      })
    })

    it('should pin dag-cbor with dag-pb child', async () => {
      const child = await ipfs.dag.put(new DAGNode(uint8ArrayFromString(`${Math.random()}`)), {
        format: 'dag-pb',
        hashAlg: 'sha2-256'
      })
      const parent = await ipfs.dag.put({
        child
      }, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      })

      await ipfs.pin.add(parent, {
        recursive: true
      })

      const pins = await all(ipfs.pin.ls())

      expect(pins).to.deep.include({
        cid: parent,
        type: 'recursive'
      })
      expect(pins).to.deep.include({
        cid: child,
        type: 'indirect'
      })
    })

    it('should respect timeout option when pinning a block', () => {
      return testTimeout(() => ipfs.pin.add(new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ'), {
        timeout: 1
      }))
    })
  })
}
