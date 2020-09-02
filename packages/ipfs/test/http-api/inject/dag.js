/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const DAGNode = require('ipld-dag-pb').DAGNode
const Readable = require('stream').Readable
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const CID = require('cids')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const { AbortSignal } = require('abort-controller')

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
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined,
      path: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/dag/get')
    })

    it('returns error for request without argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/get'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('returns error for request with invalid argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/get?arg=5'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('returns value', async () => {
      const node = new DAGNode(Uint8Array.from([]), [])
      ipfs.dag.get.withArgs(cid, defaultOptions).returns({ value: node })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toString()}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.links').that.is.empty()
      expect(res).to.have.nested.property('result.data').that.is.empty()
    })

    it('uses text encoding for data by default', async () => {
      const node = new DAGNode(Uint8Array.from([0, 1, 2, 3]), [])
      ipfs.dag.get.withArgs(cid, defaultOptions).returns({ value: node })

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
      const node = new DAGNode(Uint8Array.from([0, 1, 2, 3]), [])
      ipfs.dag.get.withArgs(cid, defaultOptions).returns({ value: node })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toString()}&data-encoding=base64`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.links').that.is.empty()
      expect(res).to.have.nested.property('result.data').that.equals('AAECAw==')
    })

    it('returns value with a path as part of the cid', async () => {
      ipfs.dag.get.withArgs(cid, {
        ...defaultOptions,
        path: '/foo'
      }).returns({ value: 'bar' })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toString()}/foo`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result', 'bar')
    })

    it('returns value with a path as part of the cid for dag-pb nodes', async () => {
      const node = new DAGNode(Uint8Array.from([0, 1, 2, 3]), [])
      ipfs.dag.get.withArgs(cid, {
        ...defaultOptions,
        path: '/Data'
      }).returns({ value: node.Data })

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
          qux: Uint8Array.from([0, 1, 2, 3])
        }
      }
      ipfs.dag.get.withArgs(cid, defaultOptions).returns({ value: node })

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
        baz: Uint8Array.from([0, 1, 2, 3])
      }
      ipfs.dag.get.withArgs(cid, defaultOptions).returns({ value: node })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toString()}&data-encoding=hex`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.baz', '00010203')
    })

    it('accepts a timeout', async () => {
      const node = {
        foo: 'bar'
      }
      ipfs.dag.get.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).returns({ value: node })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toString()}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.foo', 'bar')
    })
  })

  describe('/put', () => {
    const defaultOptions = {
      format: 'dag-cbor',
      hashAlg: 'sha2-256',
      pin: false,
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

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
      ipfs.dag.put.withArgs(node, defaultOptions).returns(cid)

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
      ipfs.dag.put.withArgs(node, {
        ...defaultOptions,
        format: 'dag-pb'
      }).returns(cid)

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
      ipfs.dag.put.withArgs(node, {
        ...defaultOptions,
        format: 'raw'
      }).returns(cid)

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
      ipfs.dag.put.withArgs(node, {
        ...defaultOptions,
        pin: true
      }).returns(cid)

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put?pin=true',
        ...await toHeadersAndPayload(JSON.stringify(node))
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
    })

    it('accepts a timeout', async () => {
      const node = {
        foo: 'bar'
      }
      ipfs.dag.put.withArgs(node, {
        ...defaultOptions,
        timeout: 1000
      }).returns(cid)

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put?timeout=1s',
        ...await toHeadersAndPayload(JSON.stringify(node))
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
    })
  })

  describe('/resolve', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined,
      path: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/dag/resolve')
    })

    it('returns error for request without argument', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/resolve'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('resolves a node', async () => {
      ipfs.dag.resolve.withArgs(cid, defaultOptions).returns({
        cid,
        remainderPath: ''
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/resolve?arg=${cid.toString()}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
      expect(res).to.have.nested.property('result.RemPath', '')
    })

    it('resolves a node with a path arg', async () => {
      ipfs.dag.resolve.withArgs(cid, {
        ...defaultOptions,
        path: '/foo'
      }).returns({
        cid,
        remainderPath: ''
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/resolve?arg=${cid.toString()}&path=/foo`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
      expect(res).to.have.nested.property('result.RemPath', '')
    })

    it('returns the remainder path from within the resolved node', async () => {
      ipfs.dag.resolve.withArgs(cid, {
        ...defaultOptions,
        path: '/foo'
      }).returns({
        cid,
        remainderPath: 'foo'
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/resolve?arg=${cid.toString()}/foo`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
      expect(res).to.have.nested.property('result.RemPath', 'foo')
    })

    it('returns an error when the path is not available', async () => {
      ipfs.dag.resolve.withArgs(cid, {
        ...defaultOptions,
        path: '/bar'
      }).throws(new Error('Not found'))

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/resolve?arg=${cid.toString()}/bar`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 500)
      expect(res.result).to.be.ok()
    })

    it('resolves across multiple nodes, returning the CID of the last node traversed', async () => {
      const cid2 = new CID('QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNA')

      ipfs.dag.resolve.withArgs(cid, {
        ...defaultOptions,
        path: '/foo/bar'
      }).returns({
        cid: cid2,
        remainderPath: 'bar'
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/resolve?arg=${cid.toString()}/foo/bar`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid2.toString() })
      expect(res).to.have.nested.property('result.RemPath', 'bar')
    })

    it('accepts a timeout', async () => {
      ipfs.dag.resolve.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).returns({
        cid,
        remainderPath: ''
      })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/resolve?arg=${cid.toString()}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
      expect(res).to.have.nested.property('result.RemPath', '')
    })
  })
})
