/* eslint-env mocha */
'use strict'

const dagPB = require('@ipld/dag-pb')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')

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

  describe('.dag.resolve', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    it('should respect timeout option when resolving a path within a DAG node', async () => {
      const cid = await ipfs.dag.put({}, { format: 'dag-cbor', hashAlg: 'sha2-256' })

      return testTimeout(() => ipfs.dag.resolve(cid, {
        timeout: 1
      }))
    })

    it('should resolve a path inside a cbor node', async () => {
      const obj = {
        a: 1,
        b: [1, 2, 3],
        c: {
          ca: [5, 6, 7],
          cb: 'foo'
        }
      }

      const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' })

      const result = await ipfs.dag.resolve(`${cid}/c/cb`)
      expect(result).to.have.deep.property('cid', cid)
      expect(result).to.have.property('remainderPath', 'c/cb')
    })

    it('should resolve a path inside a cbor node by CID', async () => {
      const obj = {
        a: 1,
        b: [1, 2, 3],
        c: {
          ca: [5, 6, 7],
          cb: 'foo'
        }
      }

      const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' })

      const result = await ipfs.dag.resolve(cid, { path: '/c/cb' })
      expect(result).to.have.deep.property('cid', cid)
      expect(result).to.have.property('remainderPath', 'c/cb')
    })

    it('should resolve a multi-node path inside a cbor node', async () => {
      const obj0 = {
        ca: [5, 6, 7],
        cb: 'foo'
      }
      const cid0 = await ipfs.dag.put(obj0, { format: 'dag-cbor', hashAlg: 'sha2-256' })

      const obj1 = {
        a: 1,
        b: [1, 2, 3],
        c: cid0
      }

      const cid1 = await ipfs.dag.put(obj1, { format: 'dag-cbor', hashAlg: 'sha2-256' })

      const result = await ipfs.dag.resolve(`/ipfs/${cid1}/c/cb`)
      expect(result).to.have.deep.property('cid', cid0)
      expect(result).to.have.property('remainderPath', 'cb')
    })

    it('should resolve a multi-node path inside a cbor node by CID', async () => {
      const obj0 = {
        ca: [5, 6, 7],
        cb: 'foo'
      }
      const cid0 = await ipfs.dag.put(obj0, { format: 'dag-cbor', hashAlg: 'sha2-256' })

      const obj1 = {
        a: 1,
        b: [1, 2, 3],
        c: cid0
      }

      const cid1 = await ipfs.dag.put(obj1, { format: 'dag-cbor', hashAlg: 'sha2-256' })

      const result = await ipfs.dag.resolve(cid1, { path: '/c/cb' })
      expect(result).to.have.deep.property('cid', cid0)
      expect(result).to.have.property('remainderPath', 'cb')
    })

    it('should resolve a raw node', async () => {
      const node = uint8ArrayFromString('hello world')
      const cid = await ipfs.dag.put(node, { format: 'raw', hashAlg: 'sha2-256' })

      const result = await ipfs.dag.resolve(cid, { path: '/' })
      expect(result).to.have.deep.property('cid', cid)
      expect(result).to.have.property('remainderPath', '')
    })

    it('should resolve a path inside a dag-pb node linked to from another dag-pb node', async () => {
      const someData = uint8ArrayFromString('some other data')
      const childNode = {
        Data: someData,
        Links: []
      }
      const childCid = await ipfs.dag.put(childNode, { format: 'dag-pb', hashAlg: 'sha2-256' })

      const linkToChildNode = {
        Name: 'foo',
        Tsize: dagPB.encode(childNode).length,
        Hash: childCid
      }
      const parentNode = {
        Data: uint8ArrayFromString('derp'),
        Links: [linkToChildNode]
      }
      const parentCid = await ipfs.dag.put(parentNode, { format: 'dag-pb', hashAlg: 'sha2-256' })

      const result = await ipfs.dag.resolve(parentCid, { path: '/foo' })
      expect(result).to.have.deep.property('cid', childCid)
      expect(result).to.have.property('remainderPath', '')
    })
  })
}
