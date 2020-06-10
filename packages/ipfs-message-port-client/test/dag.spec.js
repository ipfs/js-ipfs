/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const { Buffer } = require('buffer')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { DAGNode } = require('ipld-dag-pb')
const CID = require('cids')
const { activate } = require('./util/client')

describe('dag', function () {
  this.timeout(10 * 1000)
  let ipfs = null
  before(() => {
    ipfs = activate()
  })

  after(() => {
    ipfs = null
  })

  // describe('get', () => {
  //   it('should throw error for invalid string CID input', () => {
  //     return expect(ipfs.dag.get('INVALID CID'))
  //       .to.eventually.be.rejected()
  //       .and.to.have.property('code')
  //       .that.equals('ERR_INVALID_CID')
  //   })

  //   // it('should throw error for invalid buffer CID input', () => {
  //   //   return expect(ipfs.dag.get(Buffer.from('INVALID CID')))
  //   //     .to.eventually.be.rejected()
  //   //     .and.to.have.property('code')
  //   //     .that.equals('ERR_INVALID_CID')
  //   // })
  // })

  // describe('tree', () => {
  //   it('should throw error for invalid CID input', () => {
  //     return expect(all(ipfs.dag.tree('INVALID CID')))
  //       .to.eventually.be.rejected()
  //       .and.to.have.property('code')
  //       .that.equals('ERR_INVALID_CID')
  //   })
  // })

  describe('ipfs.dag', () => {
    it('should be able to put and get a DAG node with format dag-pb', async () => {
      const data = Buffer.from('some data')
      const { Data, Links } = new DAGNode(data)
      const node = { Data, Links }

      let cid = await ipfs.dag.put(node, {
        format: 'dag-pb',
        hashAlg: 'sha2-256'
      })
      cid = cid.toV0()
      expect(cid.codec).to.equal('dag-pb')
      cid = cid.toBaseEncodedString('base58btc')
      // expect(cid).to.equal('bafybeig3t3eugdchignsgkou3ly2mmy4ic4gtfor7inftnqn3yq4ws3a5u')
      expect(cid).to.equal('Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')

      const result = await ipfs.dag.get(cid)

      expect(result.value.Data).to.deep.equal(data)
    })

    it('should be able to put and get a DAG node with format dag-cbor', async () => {
      const cbor = { foo: 'dag-cbor-bar' }
      let cid = await ipfs.dag.put(cbor, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      })

      expect(cid.codec).to.equal('dag-cbor')
      cid = cid.toBaseEncodedString('base32')
      expect(cid).to.equal(
        'bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce'
      )

      const result = await ipfs.dag.get(cid)

      expect(result.value).to.deep.equal(cbor)
    })
  })
})
