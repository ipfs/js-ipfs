/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { fixtures, clearPins, expectPinned, expectNotPinned, pinTypes } from './utils.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import all from 'it-all'
import drain from 'it-drain'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testAdd (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.add', function () {
    this.timeout(50 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    before(async () => {
      ipfs = (await factory.spawn()).api

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

    after(() => factory.clean())

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
        .to.eventually.be.rejectedWith(/already pinned recursively/)
    })

    it('should fail to pin a hash not in datastore', async function () {
      // @ts-ignore this is mocha
      this.slow(3 * 1000)
      // @ts-ignore this is mocha
      this.timeout(5 * 1000)
      const falseHash = `${`${fixtures.directory.cid}`.slice(0, -2)}ss`

      await expect(ipfs.pin.add(falseHash, { timeout: '2s' }))
        .to.eventually.be.rejected().with.property('name', 'TimeoutError')
    })

    it('needs all children in datastore to pin recursively', async function () {
      // @ts-ignore this is mocha
      this.slow(3 * 1000)
      // @ts-ignore this is mocha
      this.timeout(5 * 1000)
      await all(ipfs.block.rm(fixtures.directory.files[0].cid))

      await expect(ipfs.pin.add(fixtures.directory.cid, { timeout: '2s' }))
        .to.eventually.be.rejected().with.property('name', 'TimeoutError')
    })

    it('should pin dag-cbor', async () => {
      const cid = await ipfs.dag.put({}, {
        storeCodec: 'dag-cbor',
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
        storeCodec: 'raw',
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
      const child = await ipfs.dag.put({
        Data: uint8ArrayFromString(`${Math.random()}`),
        Links: []
      }, {
        storeCodec: 'dag-pb',
        hashAlg: 'sha2-256'
      })
      const parent = await ipfs.dag.put({
        child
      }, {
        storeCodec: 'dag-cbor',
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
  })
}
