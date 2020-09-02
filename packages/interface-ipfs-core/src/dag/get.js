/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const dagCBOR = require('ipld-dag-cbor')
const importer = require('ipfs-unixfs-importer')
const Unixfs = require('ipfs-unixfs')
const all = require('it-all')
const CID = require('cids')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dag.get', () => {
    let ipfs
    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    let pbNode
    let cborNode
    let nodePb
    let nodeCbor
    let cidPb
    let cidCbor

    before(async () => {
      const someData = uint8ArrayFromString('some other data')
      pbNode = new DAGNode(someData)
      cborNode = {
        data: someData
      }

      nodePb = new DAGNode(uint8ArrayFromString('I am inside a Protobuf'))
      cidPb = await dagPB.util.cid(nodePb.serialize())
      nodeCbor = {
        someData: 'I am inside a Cbor object',
        pb: cidPb
      }

      cidCbor = await dagCBOR.util.cid(dagCBOR.util.serialize(nodeCbor))

      await ipfs.dag.put(nodePb, { format: 'dag-pb', hashAlg: 'sha2-256' })
      await ipfs.dag.put(nodeCbor, { format: 'dag-cbor', hashAlg: 'sha2-256' })
    })

    it('should respect timeout option when getting a DAG node', () => {
      return testTimeout(() => ipfs.dag.get(new CID('QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'), {
        timeout: 1
      }))
    })

    it('should get a dag-pb node', async () => {
      const cid = await ipfs.dag.put(pbNode, {
        format: 'dag-pb',
        hashAlg: 'sha2-256'
      })

      const result = await ipfs.dag.get(cid)

      const node = result.value
      expect(pbNode.toJSON()).to.eql(node.toJSON())
    })

    it('should get a dag-cbor node', async () => {
      const cid = await ipfs.dag.put(cborNode, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      })

      const result = await ipfs.dag.get(cid)

      const node = result.value
      expect(cborNode).to.eql(node)
    })

    it('should get a dag-pb node with path', async () => {
      const result = await ipfs.dag.get(cidPb, {
        path: '/'
      })

      const node = result.value

      const cid = await dagPB.util.cid(node.serialize())
      expect(cid).to.eql(cidPb)
    })

    it('should get a dag-pb node local value', async function () {
      const result = await ipfs.dag.get(cidPb, {
        path: 'Data'
      })
      expect(result.value).to.eql(uint8ArrayFromString('I am inside a Protobuf'))
    })

    it.skip('should get a dag-pb node value one level deep', (done) => {})
    it.skip('should get a dag-pb node value two levels deep', (done) => {})

    it('should get a dag-cbor node with path', async () => {
      const result = await ipfs.dag.get(cidCbor, {
        path: '/'
      })

      const node = result.value

      const cid = await dagCBOR.util.cid(dagCBOR.util.serialize(node))
      expect(cid).to.eql(cidCbor)
    })

    it('should get a dag-cbor node local value', async () => {
      const result = await ipfs.dag.get(cidCbor, {
        path: 'someData'
      })
      expect(result.value).to.eql('I am inside a Cbor object')
    })

    it.skip('should get dag-cbor node value one level deep', (done) => {})
    it.skip('should get dag-cbor node value two levels deep', (done) => {})
    it.skip('should get dag-cbor value via dag-pb node', (done) => {})

    it('should get dag-pb value via dag-cbor node', async function () {
      const result = await ipfs.dag.get(cidCbor, {
        path: 'pb/Data'
      })
      expect(result.value).to.eql(uint8ArrayFromString('I am inside a Protobuf'))
    })

    it('should get by CID string', async () => {
      const cidCborStr = cidCbor.toBaseEncodedString()

      const result = await ipfs.dag.get(cidCborStr)

      const node = result.value

      const cid = await dagCBOR.util.cid(dagCBOR.util.serialize(node))
      expect(cid).to.eql(cidCbor)
    })

    it('should get by CID string + path', async function () {
      const cidCborStr = cidCbor.toBaseEncodedString()

      const result = await ipfs.dag.get(cidCborStr + '/pb/Data')
      expect(result.value).to.eql(uint8ArrayFromString('I am inside a Protobuf'))
    })

    it('should get only a CID, due to resolving locally only', async function () {
      const result = await ipfs.dag.get(cidCbor, {
        path: 'pb/Data',
        localResolve: true
      })
      expect(result.value.equals(cidPb)).to.be.true()
    })

    it('should get with options and no path', async function () {
      const result = await ipfs.dag.get(cidCbor, { localResolve: true })
      expect(result.value).to.deep.equal(nodeCbor)
    })

    it('should get a node added as CIDv0 with a CIDv1', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const node = new DAGNode(input)

      const cid = await ipfs.dag.put(node, { format: 'dag-pb', hashAlg: 'sha2-256' })
      expect(cid.version).to.equal(0)

      const cidv1 = cid.toV1()

      const output = await ipfs.dag.get(cidv1)
      expect(output.value.Data).to.eql(input)
    })

    it('should get a node added as CIDv1 with a CIDv0', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const res = await all(importer([{ content: input }], ipfs.block, {
        cidVersion: 1,
        rawLeaves: false
      }))

      const cidv1 = res[0].cid
      expect(cidv1.version).to.equal(1)

      const cidv0 = cidv1.toV0()

      const output = await ipfs.dag.get(cidv0)
      expect(Unixfs.unmarshal(output.value.Data).data).to.eql(input)
    })

    it('should be able to get part of a dag-cbor node', async () => {
      const cbor = {
        foo: 'dag-cbor-bar'
      }

      let cid = await ipfs.dag.put(cbor, { format: 'dag-cbor', hashAlg: 'sha2-256' })
      expect(cid.codec).to.equal('dag-cbor')
      cid = cid.toBaseEncodedString('base32')
      expect(cid).to.equal('bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce')

      const result = await ipfs.dag.get(cid, {
        path: 'foo'
      })
      expect(result.value).to.equal('dag-cbor-bar')
    })

    it('should be able to traverse from one dag-cbor node to another', async () => {
      const cbor1 = {
        foo: 'dag-cbor-bar'
      }

      const cid1 = await ipfs.dag.put(cbor1, { format: 'dag-cbor', hashAlg: 'sha2-256' })
      const cbor2 = { other: cid1 }

      const cid2 = await ipfs.dag.put(cbor2, { format: 'dag-cbor', hashAlg: 'sha2-256' })

      const result = await ipfs.dag.get(cid2, {
        path: 'other/foo'
      })
      expect(result.value).to.equal('dag-cbor-bar')
    })

    it('should be able to get a DAG node with format raw', async () => {
      const buf = Uint8Array.from([0, 1, 2, 3])

      const cid = await ipfs.dag.put(buf, {
        format: 'raw',
        hashAlg: 'sha2-256'
      })

      const result = await ipfs.dag.get(cid)
      expect(result.value).to.deep.equal(buf)
    })
  })
}
