/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as dagPB from '@ipld/dag-pb'
import { nanoid } from 'nanoid'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testLinks (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.links', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should get empty links by multihash', async () => {
      const testObj = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }

      const cid = await ipfs.object.put(testObj)
      const node = await ipfs.object.get(cid)
      const links = await ipfs.object.links(cid)

      expect(node.Links).to.eql(links)
    })

    it('should get links by multihash', async () => {
      const node1a = {
        Data: uint8ArrayFromString('Some data 1'),
        Links: []
      }
      const node2 = {
        Data: uint8ArrayFromString('Some data 2'),
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
      const node1bCid = await ipfs.object.put(node1b)

      const links = await ipfs.object.links(node1bCid)

      expect(links).to.have.lengthOf(1)
      expect(node1b.Links).to.deep.equal(links)
    })

    it('should get links from CBOR object', async () => {
      const hashes = []

      const res1 = await ipfs.add(uint8ArrayFromString('test data'))
      hashes.push(res1.cid)

      const res2 = await ipfs.add(uint8ArrayFromString('more test data'))
      hashes.push(res2.cid)

      const obj = {
        some: 'data',
        mylink: hashes[0],
        myobj: {
          anotherLink: hashes[1]
        }
      }
      const cid = await ipfs.dag.put(obj)

      const links = await ipfs.object.links(cid)
      expect(links.length).to.eql(2)

      // TODO: js-ipfs succeeds but go returns empty strings for link name
      // const names = [links[0].name, links[1].name]
      // expect(names).includes('mylink')
      // expect(names).includes('myobj/anotherLink')

      const cids = [links[0].Hash.toString(), links[1].Hash.toString()]
      expect(cids).includes(hashes[0].toString())
      expect(cids).includes(hashes[1].toString())
    })

    it('returns error for request without argument', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.links(null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request with invalid argument', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.links('invalid', { enc: 'base58' })).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}
