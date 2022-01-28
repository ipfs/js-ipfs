/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { Readable } from 'stream'
import FormData from 'form-data'
import streamToPromise from 'stream-to-promise'
import { CID } from 'multiformats/cid'
import { testHttpMethod } from '../utils/test-http-method.js'
import { http } from '../utils/http.js'
import { matchIterable } from '../utils/match-iterable.js'
import sinon from 'sinon'
import { base58btc } from 'multiformats/bases/base58'
import { base32 } from 'multiformats/bases/base32'
import drain from 'it-drain'

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
  const cid = CID.parse('QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR')
  let ipfs

  beforeEach(() => {
    ipfs = {
      dag: {
        get: sinon.stub(),
        put: sinon.stub(),
        resolve: sinon.stub(),
        import: sinon.stub(),
        export: sinon.stub()
      },
      block: {
        put: sinon.stub()
      },
      bases: {
        getBase: sinon.stub()
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
      const node = {
        Data: Uint8Array.from([]),
        Links: []
      }
      ipfs.dag.get.withArgs(cid, defaultOptions).returns({ value: node })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toString()}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Links').that.is.empty()
      expect(res).to.have.nested.property('result.Data').that.is.empty()
    })

    it('uses text encoding for data by default', async () => {
      const node = {
        Data: Uint8Array.from([0, 1, 2, 3]),
        Links: []
      }
      ipfs.dag.get.withArgs(cid, defaultOptions).returns({ value: node })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result).to.be.ok()
      expect(res).to.have.nested.property('result.Links').that.is.empty()
      expect(res).to.have.nested.property('result.Data', '\u0000\u0001\u0002\u0003')
    })

    it('overrides data encoding', async () => {
      const node = {
        Data: Uint8Array.from([0, 1, 2, 3]),
        Links: []
      }
      ipfs.dag.get.withArgs(cid, defaultOptions).returns({ value: node })

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/get?arg=${cid.toString()}&data-encoding=base64`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result.Links').that.is.empty()
      expect(res).to.have.nested.property('result.Data').that.equals('AAECAw==')
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
      const node = {
        Data: Uint8Array.from([0, 1, 2, 3]),
        Links: []
      }
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
      inputCodec: 'dag-json',
      storeCodec: 'dag-cbor',
      hashAlg: 'sha2-256',
      version: 1,
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
      ipfs.bases.getBase.withArgs('base32').returns(base32)
      const node = {
        foo: 'bar'
      }
      const encoded = Buffer.from(JSON.stringify(node))
      ipfs.dag.put.withArgs(encoded, defaultOptions).returns(cid.toV1())

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put',
        ...await toHeadersAndPayload(JSON.stringify(node))
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toV1().toString() })
    })

    it('adds a dag-pb node', async () => {
      ipfs.bases.getBase.withArgs('base32').returns(base32)
      const node = {
        data: [],
        links: []
      }
      const encoded = Buffer.from(JSON.stringify(node))
      ipfs.dag.put.withArgs(encoded, {
        ...defaultOptions,
        storeCodec: 'dag-pb'
      }).returns(cid.toV1())

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put?storeCodec=dag-pb',
        ...await toHeadersAndPayload(JSON.stringify(node))
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toV1().toString() })
    })

    it('defaults to base58btc when adding a v0 dag-pb node', async () => {
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const node = {
        data: [],
        links: []
      }
      const encoded = Buffer.from(JSON.stringify(node))
      ipfs.dag.put.withArgs(encoded, {
        ...defaultOptions,
        version: 0,
        inputCodec: 'dag-json',
        storeCodec: 'dag-pb'
      }).returns(cid)

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put?inputCodec=dag-json&storeCodec=dag-pb&version=0',
        ...await toHeadersAndPayload(JSON.stringify(node))
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toString() })
    })

    it('adds a raw node', async () => {
      ipfs.bases.getBase.withArgs('base32').returns(base32)
      const node = Buffer.from([0, 1, 2, 3])
      ipfs.dag.put.withArgs(node, {
        ...defaultOptions,
        storeCodec: 'raw'
      }).returns(cid.toV1())

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put?storeCodec=raw',
        ...await toHeadersAndPayload(node)
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toV1().toString() })
    })

    it('pins a node after adding', async () => {
      ipfs.bases.getBase.withArgs('base32').returns(base32)
      const node = {
        foo: 'bar'
      }
      const encoded = Buffer.from(JSON.stringify(node))
      ipfs.dag.put.withArgs(encoded, {
        ...defaultOptions,
        pin: true
      }).returns(cid.toV1())

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put?pin=true',
        ...await toHeadersAndPayload(JSON.stringify(node))
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toV1().toString() })
    })

    it('adds a node with an esoteric format', async () => {
      ipfs.bases.getBase.withArgs('base32').returns(base32)
      const cid = CID.parse('baf4beiata6mq425fzikf5m26temcvg7mizjrxrkn35swuybmpah2ajan5y')
      const data = Buffer.from('some data')
      const codec = 'git-raw'

      ipfs.dag.put.withArgs(data, {
        ...defaultOptions,
        inputCodec: codec,
        storeCodec: codec
      }).returns(cid.toV1())

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/put?storeCodec=${codec}&inputCodec=${codec}`,
        ...await toHeadersAndPayload(data)
      }, { ipfs })

      expect(ipfs.dag.put.called).to.be.true()
      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toV1().toString() })
    })

    it('accepts a timeout', async () => {
      ipfs.bases.getBase.withArgs('base32').returns(base32)
      const node = {
        foo: 'bar'
      }
      const encoded = Buffer.from(JSON.stringify(node))
      ipfs.dag.put.withArgs(encoded, {
        ...defaultOptions,
        timeout: 1000
      }).returns(cid.toV1())

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/put?timeout=1s',
        ...await toHeadersAndPayload(JSON.stringify(node))
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.deep.nested.property('result.Cid', { '/': cid.toV1().toString() })
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
      const cid2 = CID.parse('QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNA')

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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)
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

  describe('/import', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined,
      pinRoots: true
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/dag/import')
    })

    it('imports car', async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.dag.import.withArgs(matchIterable(), {
        ...defaultOptions
      })
        .callsFake(async function * (source) {
          await drain(source)
          yield { root: { cid, pinErrorMsg: '' } }
        })

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/import',
        ...await toHeadersAndPayload('car content')
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)

      const response = JSON.parse(res.result)
      expect(response).to.have.nested.property('Root.Cid./', cid.toString())
      expect(response).to.have.nested.property('Root.PinErrorMsg').that.is.empty()
    })

    it('imports car with pin error', async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.dag.import.withArgs(matchIterable(), {
        ...defaultOptions
      })
        .callsFake(async function * (source) {
          await drain(source)
          yield { root: { cid, pinErrorMsg: 'derp' } }
        })

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/import',
        ...await toHeadersAndPayload('car content')
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)

      const response = JSON.parse(res.result)
      expect(response).to.have.nested.property('Root.Cid./', cid.toString())
      expect(response).to.have.nested.property('Root.PinErrorMsg').that.equals('derp')
    })

    it('imports car without pinning', async () => {
      ipfs.dag.import.withArgs(matchIterable(), {
        ...defaultOptions,
        pinRoots: false
      })
        .callsFake(async function * (source) { // eslint-disable-line require-yield
          await drain(source)
        })

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/import?pin-roots=false',
        ...await toHeadersAndPayload('car content')
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res.result).to.be.empty()
    })

    it('imports car with timeout', async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.dag.import.withArgs(matchIterable(), {
        ...defaultOptions,
        timeout: 1000
      })
        .callsFake(async function * (source) {
          await drain(source)
          yield { root: { cid, pinErrorMsg: '' } }
        })

      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/import?timeout=1s',
        ...await toHeadersAndPayload('car content')
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)

      const response = JSON.parse(res.result)
      expect(response).to.have.nested.property('Root.Cid./', cid.toString())
      expect(response).to.have.nested.property('Root.PinErrorMsg').that.equals('')
    })
  })

  describe('/export', () => {
    const defaultOptions = {
      signal: sinon.match.instanceOf(AbortSignal),
      timeout: undefined
    }

    it('only accepts POST', () => {
      return testHttpMethod('/api/v0/dag/export')
    })

    it('returns error for request without root', async () => {
      const res = await http({
        method: 'POST',
        url: '/api/v0/dag/export'
      }, { ipfs })

      expect(res).to.have.property('statusCode', 400)
    })

    it('exports car', async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.dag.export.withArgs(cid, {
        ...defaultOptions
      })
        .returns(['some data'])

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/export?arg=${cid}`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result', 'some data')
    })

    it('exports car with a timeout', async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.dag.export.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      })
        .returns(['some data'])

      const res = await http({
        method: 'POST',
        url: `/api/v0/dag/export?arg=${cid}&timeout=1s`
      }, { ipfs })

      expect(res).to.have.property('statusCode', 200)
      expect(res).to.have.nested.property('result', 'some data')
    })
  })
})
