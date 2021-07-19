/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const createNode = require('./utils/create-node')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')

describe('ipld', function () {
  this.timeout(10 * 1000)

  let ipfs
  let cleanup

  before(async () => {
    const customCodec = {
      name: 'custom-codec',
      code: 1337,
      encode: (str) => uint8ArrayFromString(str),
      decode: (buf) => uint8ArrayToString(buf)
    }

    const res = await createNode({
      ipld: {
        codecs: [
          customCodec
        ]
      }
    })
    ipfs = res.ipfs
    cleanup = res.cleanup
  })

  after(() => cleanup())

  it('should allow codecs to be specified without overwriting others', async () => {
    const dagCborNode = {
      hello: 'world'
    }
    const cid1 = await ipfs.dag.put(dagCborNode, {
      format: 'dag-cbor',
      hashAlg: 'sha2-256'
    })

    const dagPbNode = {
      Data: new Uint8Array(0),
      Links: []
    }
    const cid2 = await ipfs.dag.put(dagPbNode, {
      format: 'dag-pb',
      hashAlg: 'sha2-256'
    })

    const customNode = 'totally custom'
    const cid3 = await ipfs.dag.put(customNode, {
      format: 'custom-codec',
      hashAlg: 'sha2-256'
    })

    await expect(ipfs.dag.get(cid1)).to.eventually.have.property('value').that.deep.equals(dagCborNode)
    await expect(ipfs.dag.get(cid2)).to.eventually.have.property('value').that.deep.equals(dagPbNode)
    await expect(ipfs.dag.get(cid3)).to.eventually.have.property('value').that.deep.equals(customNode)
  })
})
