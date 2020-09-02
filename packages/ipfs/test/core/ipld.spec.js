/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const factory = require('../utils/factory')
const ipldDagPb = require('ipld-dag-pb')

describe('ipld', function () {
  this.timeout(10 * 1000)
  const df = factory()

  after(() => df.clean())

  it('should allow formats to be specified without overwriting others', async () => {
    const ipfs = (await df.spawn({
      type: 'proc',
      ipfsOptions: {
        ipld: {
          formats: [
            require('ipld-dag-pb')
          ]
        }
      }
    })).api

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
