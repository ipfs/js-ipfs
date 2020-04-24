/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const DAGNode = require('ipld-dag-pb').DAGNode
const Readable = require('stream').Readable
const FormData = require('form-data')
const { Buffer } = require('buffer')
const streamToPromise = require('stream-to-promise')
const CID = require('cids')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')

const toHeadersAndPayload = async (thing) => {
  const stream = new Readable()
  stream.push(thing)
  stream.push(null)

  const form = new FormData()
  form.append('file', stream)

  return {
    headers: form.getHeaders(),
    payload: await streamToPromise(form)
  }
}

describe('/dag', () => {
  const cid = new CID('QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR')
  let ipfs

  beforeEach(() => {
    ipfs = {
      dag: {
        get: sinon.stub(),
        put: sinon.stub(),
        resolve: sinon.stub()
      }
    }
  })

  describe('/get', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/dag/get')
    })

    it('returns error for request without argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/get'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes("Argument 'key' is required")
    })

    it('returns error for request with invalid argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/get?arg=5'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes("invalid 'ipfs ref' path")
    })

    it('returns value', async () => {
      const node = new DAGNode(Buffer.from([]), [])
      ipfs.dag.get.withArgs(cid).returns({ value: node })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toString()}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.links').that.is.empty()
      expect(res).to.have.nested.property('result.data').that.is.empty()
    })

    it('uses text encoding for data by default', async () => {
      const node = new DAGNode(Buffer.from([0, 1, 2, 3]), [])
      ipfs.dag.get.withArgs(cid).returns({ value: node })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toBaseEncodedString()}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result).to.be.ok()
      expect(res).to.have.nested.property('result.links').that.is.empty()
      expect(res).to.have.nested.property('result.data', '\u0000\u0001\u0002\u0003')
    })

    it('overrides data encoding', async () => {
      const node = new DAGNode(Buffer.from([0, 1, 2, 3]), [])
      ipfs.dag.get.withArgs(cid).returns({ value: node })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toString()}&data-encoding=base64`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.links').that.is.empty()
      expect(res).to.have.nested.property('result.data').that.equals('AAECAw==')
    })

    it('returns value with a path as part of the cid', async () => {
      ipfs.dag.get.withArgs(cid, 'foo').returns({ value: 'bar' })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toString()}/foo`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result', 'bar')
    })

    it('returns value with a path as part of the cid for dag-pb nodes', async () => {
      const node = new DAGNode(Buffer.from([0, 1, 2, 3]), [])
      ipfs.dag.get.withArgs(cid, 'Data').returns({ value: node.Data })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toString()}/Data&data-encoding=base64`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.property('result', 'AAECAw==')
    })

    it('encodes buffers in arbitrary positions', async () => {
      const node = {
        foo: 'bar',
        baz: {
          qux: Buffer.from([0, 1, 2, 3])
        }
      }
      ipfs.dag.get.withArgs(cid).returns({ value: node })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toString()}&data-encoding=base64`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.baz.qux', 'AAECAw==')
    })

    it('supports specifying buffer encoding', async () => {
      const node = {
        foo: 'bar',
        baz: Buffer.from([0, 1, 2, 3])
      }
      ipfs.dag.get.withArgs(cid).returns({ value: node })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toString()}&data-encoding=hex`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.baz', '00010203')
    })
  })

  describe('/put', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/dag/put')
    })

    it('returns error for request without file argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res).to.have.nested.property('result.Message').that.includes("File argument 'object data' is required")
    })

    it('adds a dag-cbor node by default', async () => {
      const node = {
        foo: 'bar'
      }
      ipfs.dag.put.withArgs(node).returns(cid)

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put',
        ...await toHeadersAndPayload(JSON.stringify(node))
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
    })

    it('adds a dag-pb node', async () => {
      const node = {
        data: [],
        links: []
      }
      ipfs.dag.put.withArgs(node, sinon.match({
        format: 'dag-pb'
      })).returns(cid)

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put?format=dag-pb',
        ...await toHeadersAndPayload(JSON.stringify(node))
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
    })

    it('adds a raw node', async () => {
      const node = Buffer.from([0, 1, 2, 3])
      ipfs.dag.put.withArgs(node, sinon.match({
        format: 'raw'
      })).returns(cid)

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put?format=raw',
        ...await toHeadersAndPayload(node)
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
    })

    it('pins a node after adding', async () => {
      const node = {
        foo: 'bar'
      }
      ipfs.dag.put.withArgs(node, sinon.match({
        pin: true
      })).returns(cid)

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put?pin=true',
        ...await toHeadersAndPayload(JSON.stringify(node))
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
    })

    it('does not pin a node after adding', async () => {
      const node = {
        foo: 'bar'
      }
      ipfs.dag.put.withArgs(node, sinon.match({
        pin: false
      })).returns(cid)

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put?pin=false',
        ...await toHeadersAndPayload(JSON.stringify(node))
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
    })

    it('does not pin a node by default', async () => {
      const node = {
        foo: 'bar'
      }
      ipfs.dag.put.withArgs(node, sinon.match({
        pin: false
      })).returns(cid)

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put',
        ...await toHeadersAndPayload(JSON.stringify(node))
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
    })
  })

  describe('/resolve', () => {
    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/dag/resolve')
    })

    it('returns error for request without argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/resolve'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
      expect(res.result.Message).to.include('argument "ref" is required')
    })

    it('resolves a node', async () => {
      ipfs.dag.resolve.withArgs(cid).returns([{
        value: cid,
        remainderPath: ''
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/resolve?arg=${cid.toString()}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
      expect(res).to.have.nested.property('result.RemPath', '')
    })

    it('returns the remainder path from within the resolved node', async () => {
      ipfs.dag.resolve.withArgs(cid, 'foo').returns([{
        value: {
          value: cid,
          remainderPath: 'foo'
        }
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/resolve?arg=${cid.toString()}/foo`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
      expect(res).to.have.nested.property('result.RemPath', 'foo')
    })

    it('returns an error when the path is not available', async () => {
      ipfs.dag.resolve.withArgs(cid, 'bar').throws(new Error('Not found'))

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/resolve?arg=${cid.toString()}/bar`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 500)
      expect(res.result).to.be.ok()
    })

    it('resolves across multiple nodes, returning the CID of the last node traversed', async () => {
      const cid2 = new CID('QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNA')

      ipfs.dag.resolve.withArgs(cid, 'foo/bar').returns([{
        value: cid,
        remainderPath: 'foo'
      }, {
        value: cid2,
        remainderPath: 'bar'
      }])

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/resolve?arg=${cid.toString()}/foo/bar`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid2.toString() })
      expect(res).to.have.nested.property('result.RemPath', 'bar')
    })
  })
})
