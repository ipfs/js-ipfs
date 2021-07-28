/* eslint-env mocha */
'use strict'

const dagPB = require('@ipld/dag-pb')
const { nanoid } = require('nanoid')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { UnixFS } = require('ipfs-unixfs')
const { randomBytes } = require('iso-random-stream')
const { fromString: uint8ArrayFromString } = require('@vascosantos/uint8arrays/from-string')
const { CID } = require('multiformats/cid')
const { sha256 } = require('multiformats/hashes/sha2')

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
module.exports = (factory, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.get', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should get object by multihash', async () => {
      const obj = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }

      const node1Cid = await ipfs.object.put(obj)
      const node1 = await ipfs.object.get(node1Cid)
      let node2 = await ipfs.object.get(node1Cid)

      // because js-ipfs-api can't infer if the
      // returned Data is Uint8Array or String
      if (typeof node2.Data === 'string') {
        node2 = {
          Data: uint8ArrayFromString(node2.Data),
          Links: node2.Links
        }
      }

      expect(node1.Data).to.eql(node2.Data)
      expect(node1.Links).to.eql(node2.Links)
    })

    it('should get object with links by multihash string', async () => {
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
      let node1c = await ipfs.object.get(node1bCid)

      // because js-ipfs-api can't infer if the
      // returned Data is Uint8Array or String
      if (typeof node1c.Data === 'string') {
        node1c = {
          Data: uint8ArrayFromString(node1c.Data),
          Links: node1c.Links
        }
      }

      expect(node1a.Data).to.eql(node1c.Data)
    })

    it('should get object by base58 encoded multihash', async () => {
      const obj = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }

      const node1aCid = await ipfs.object.put(obj)
      const node1a = await ipfs.object.get(node1aCid)
      let node1b = await ipfs.object.get(node1aCid, { enc: 'base58' })

      // because js-ipfs-api can't infer if the
      // returned Data is Uint8Array or String
      if (typeof node1b.Data === 'string') {
        node1b = {
          Data: uint8ArrayFromString(node1b.Data),
          Links: node1b.Links
        }
      }

      expect(node1a.Data).to.eql(node1b.Data)
      expect(node1a.Links).to.eql(node1b.Links)
    })

    it('should supply unaltered data', async () => {
      // has to be big enough to span several DAGNodes
      const data = randomBytes(1024 * 3000)

      const result = await ipfs.add({
        path: '',
        content: data
      })

      const node = await ipfs.object.get(result.cid)

      if (!node.Data) {
        throw new Error('Node did not have data')
      }

      const meta = UnixFS.unmarshal(node.Data)

      expect(meta.fileSize()).to.equal(data.length)
    })

    it('should error for request without argument', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.get(null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request with invalid argument', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.get('invalid', { enc: 'base58' })).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}
