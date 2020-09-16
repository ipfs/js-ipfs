/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const ipldDagPb = require('ipld-dag-pb')
const IPFS = require('../')

describe('ipld', function () {
  this.timeout(10 * 1000)

  let ipfs

  before(async () => {
    ipfs = await IPFS.create({
      ipld: {
        formats: [
          require('ipld-dag-pb')
        ]
      }
    })
  })

  after(() => ipfs && ipfs.stop())

  it('should allow formats to be specified without overwriting others', async () => {
    const dagCborNode = {
      hello: 'world'
    }
    const cid1 = await ipfs.dag.put(dagCborNode, {
      format: 'dag-cbor',
      hashAlg: 'sha2-256'
    })

    const dagPbNode = new ipldDagPb.DAGNode(new Uint8Array(0), [], 0)
    const cid2 = await ipfs.dag.put(dagPbNode, {
      format: 'dag-pb',
      hashAlg: 'sha2-256'
    })

    await expect(ipfs.dag.get(cid1)).to.eventually.have.property('value').that.deep.equals(dagCborNode)
    await expect(ipfs.dag.get(cid2)).to.eventually.have.property('value').that.deep.equals(dagPbNode)
  })
})
