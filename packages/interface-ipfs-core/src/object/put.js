/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as dagPB from '@ipld/dag-pb'
import { nanoid } from 'nanoid'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import first from 'it-first'
import drain from 'it-drain'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testPut (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.put', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should put an object', async () => {
      const obj = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }

      const cid = await ipfs.object.put(obj)
      const node = await ipfs.object.get(cid)

      expect(node).to.deep.equal(obj)
    })

    it('should pin an object when putting', async () => {
      const obj = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }

      const cid = await ipfs.object.put(obj, {
        pin: true
      })
      const pin = await first(ipfs.pin.ls({
        paths: cid
      }))

      expect(pin).to.have.deep.property('cid', cid)
      expect(pin).to.have.property('type', 'recursive')
    })

    it('should not pin an object by default', async () => {
      const obj = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }

      const cid = await ipfs.object.put(obj)

      return expect(drain(ipfs.pin.ls({
        paths: cid
      }))).to.eventually.be.rejectedWith(/not pinned/)
    })

    it('should put a Protobuf DAGNode', async () => {
      const dNode = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }

      const cid = await ipfs.object.put(dNode)
      const node = await ipfs.object.get(cid)
      expect(dNode).to.deep.equal(node)
    })

    it('should fail if a string is passed', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.put(nanoid())).to.eventually.be.rejected()
    })

    it('should put a Protobuf DAGNode with a link', async () => {
      const node1a = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }
      const node2 = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }
      const node2Buf = dagPB.encode(node2)
      const link = {
        Name: 'some-link',
        Tsize: node2Buf.length,
        Hash: CID.createV0(await sha256.digest(node2Buf))
      }
      const node1b = {
        Data: node1a.Data,
        Links: [link]
      }

      const cid = await ipfs.object.put(node1b)
      const node = await ipfs.object.get(cid)
      expect(node1b.Data).to.deep.equal(node.Data)
      expect(node1b.Links).to.deep.equal(node.Links)
    })
  })
}
