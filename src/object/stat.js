/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { asDAGLink } = require('./utils')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.stat', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should get stats by multihash', async () => {
      const testObj = {
        Data: Buffer.from('get test object'),
        Links: []
      }

      const cid = await ipfs.object.put(testObj)
      const stats = await ipfs.object.stat(cid)
      const expected = {
        Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
        NumLinks: 0,
        BlockSize: 17,
        LinksSize: 2,
        DataSize: 15,
        CumulativeSize: 17
      }
      expect(expected).to.deep.equal(stats)
    })

    it('should respect timeout option', async () => {
      const testObj = {
        Data: Buffer.from('get test object'),
        Links: []
      }

      await ipfs.object.put(testObj)

      const timeout = 2
      const startTime = new Date()
      const badCid = 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3MzzzzzZ'

      const err = await expect(ipfs.object.stat(badCid, { timeout: `${timeout}s` })).to.be.rejected()
      const timeForRequest = (new Date() - startTime) / 1000

      if (err.code) {
        expect(err.code).to.equal('ERR_TIMEOUT')
      } else {
        expect(err.message).to.equal('failed to get block for QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3MzzzzzZ: context deadline exceeded')
      }

      expect(timeForRequest).to.not.lessThan(timeout)
      expect(timeForRequest).to.not.greaterThan(timeout + 1)
    })

    it('should get stats for object with links by multihash', async () => {
      const node1a = new DAGNode(Buffer.from('Some data 1'))
      const node2 = new DAGNode(Buffer.from('Some data 2'))

      const link = await asDAGLink(node2, 'some-link')

      const node1b = new DAGNode(node1a.Data, node1a.Links.concat(link))
      const node1bCid = await ipfs.object.put(node1b)

      const stats = await ipfs.object.stat(node1bCid)
      const expected = {
        Hash: 'QmPR7W4kaADkAo4GKEVVPQN81EDUFCHJtqejQZ5dEG7pBC',
        NumLinks: 1,
        BlockSize: 64,
        LinksSize: 53,
        DataSize: 11,
        CumulativeSize: 77
      }
      expect(expected).to.eql(stats)
    })

    it('should get stats by base58 encoded multihash', async () => {
      const testObj = {
        Data: Buffer.from('get test object'),
        Links: []
      }

      const cid = await ipfs.object.put(testObj)

      const stats = await ipfs.object.stat(cid.buffer)
      const expected = {
        Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
        NumLinks: 0,
        BlockSize: 17,
        LinksSize: 2,
        DataSize: 15,
        CumulativeSize: 17
      }
      expect(expected).to.deep.equal(stats)
    })

    it('should get stats by base58 encoded multihash string', async () => {
      const testObj = {
        Data: Buffer.from('get test object'),
        Links: []
      }

      const cid = await ipfs.object.put(testObj)

      const stats = await ipfs.object.stat(cid.toBaseEncodedString())
      const expected = {
        Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
        NumLinks: 0,
        BlockSize: 17,
        LinksSize: 2,
        DataSize: 15,
        CumulativeSize: 17
      }
      expect(expected).to.deep.equal(stats)
    })

    it('returns error for request without argument', () => {
      return expect(ipfs.object.stat(null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request with invalid argument', () => {
      return expect(ipfs.object.stat('invalid', { enc: 'base58' })).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}
