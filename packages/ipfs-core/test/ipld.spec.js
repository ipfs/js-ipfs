/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const createNode = require('./utils/create-node')
const { toString: uint8ArrayToString } = require('uint8arrays/to-string')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')
const Digest = require('multiformats/hashes/digest')

describe('ipld', function () {
  this.timeout(10 * 1000)

  /** @type {import('ipfs-core-types').IPFS} */
  let ipfs
  /** @type {() => Promise<void>} */
  let cleanup

  before(async () => {
    /** @type {import('multiformats/codecs/interface').BlockCodec<1337, string>} */
    const customCodec = {
      name: 'custom-codec',
      code: 1337,
      encode: (str) => uint8ArrayFromString(str),
      decode: (buf) => uint8ArrayToString(buf)
    }

    /** @type {import('multiformats/hashes/interface').MultihashHasher} */
    const customHasher = {
      digest: (input) => Promise.resolve(Digest.create(1338, input)),
      name: 'custom-hasher',
      code: 1338
    }

    /** @type {import('multiformats/bases/interface').MultibaseCodec<any>} */
    const customBase = {
      name: 'custom-base',
      prefix: '1339',
      encoder: {
        name: 'custom-base',
        prefix: '1339',
        encode: (input) => uint8ArrayToString(input)
      },
      decoder: {
        decode: (input) => uint8ArrayFromString(input)
      }
    }

    const res = await createNode({
      ipld: {
        codecs: [
          customCodec
        ],
        hashers: [
          customHasher
        ],
        bases: [
          customBase
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
