/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const promisify = require('promisify-es6')
const DAGNode = require('ipld-dag-pb').DAGNode
const createDAGPBNode = promisify(DAGNode.create)
const Readable = require('stream').Readable
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const CID = require('cids')

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

module.exports = (http) => {
  describe('dag endpoint', () => {
    let api

    before(() => {
      api = http.api._apiServers[0]
    })

    describe('/dag/get', () => {
      it('returns error for request without argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/dag/get'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include("Argument 'key' is required")
      })

      it('returns error for request with invalid argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/dag/get?arg=5'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include("invalid 'ipfs ref' path")
      })

      it('returns value', async () => {
        const node = await createDAGPBNode(Buffer.from([]), [])
        const cid = await http.api._ipfs.dag.put(node, {
          format: 'dag-pb',
          hashAlg: 'sha2-256'
        })
        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/dag/get?arg=${cid.toBaseEncodedString()}`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.be.ok()
        expect(res.result.links).to.be.empty()
        expect(res.result.data).to.be.empty()
      })

      it('uses text encoding for data by default', async () => {
        const node = await createDAGPBNode(Buffer.from([0, 1, 2, 3]), [])
        const cid = await http.api._ipfs.dag.put(node, {
          format: 'dag-pb',
          hashAlg: 'sha2-256'
        })

        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/dag/get?arg=${cid.toBaseEncodedString()}`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.be.ok()
        expect(res.result.links).to.be.empty()
        expect(res.result.data).to.equal('\u0000\u0001\u0002\u0003')
      })

      it('overrides data encoding', async () => {
        const node = await createDAGPBNode(Buffer.from([0, 1, 2, 3]), [])
        const cid = await http.api._ipfs.dag.put(node, {
          format: 'dag-pb',
          hashAlg: 'sha2-256'
        })

        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/dag/get?arg=${cid.toBaseEncodedString()}&data-encoding=base64`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.be.ok()
        expect(res.result.links).to.be.empty()
        expect(res.result.data).to.equal('AAECAw==')
      })

      it('returns value with a path as part of the cid', async () => {
        const cid = await http.api._ipfs.dag.put({
          foo: 'bar'
        }, {
          format: 'dag-cbor',
          hashAlg: 'sha2-256'
        })

        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/dag/get?arg=${cid.toBaseEncodedString()}/foo`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.equal('bar')
      })

      it('returns value with a path as part of the cid for dag-pb nodes', async () => {
        const node = await createDAGPBNode(Buffer.from([0, 1, 2, 3]), [])
        const cid = await http.api._ipfs.dag.put(node, {
          format: 'dag-pb',
          hashAlg: 'sha2-256'
        })

        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/dag/get?arg=${cid.toBaseEncodedString()}/Data&data-encoding=base64`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.equal('AAECAw==')
      })

      it('encodes buffers in arbitrary positions', async () => {
        const cid = await http.api._ipfs.dag.put({
          foo: 'bar',
          baz: {
            qux: Buffer.from([0, 1, 2, 3])
          }
        }, {
          format: 'dag-cbor',
          hashAlg: 'sha2-256'
        })

        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/dag/get?arg=${cid.toBaseEncodedString()}&data-encoding=base64`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.baz.qux).to.equal('AAECAw==')
      })

      it('supports specifying buffer encoding', async () => {
        const cid = await http.api._ipfs.dag.put({
          foo: 'bar',
          baz: Buffer.from([0, 1, 2, 3])
        }, {
          format: 'dag-cbor',
          hashAlg: 'sha2-256'
        })

        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/dag/get?arg=${cid.toBaseEncodedString()}&data-encoding=hex`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.baz).to.equal('00010203')
      })
    })

    describe('/dag/put', () => {
      it('returns error for request without file argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/dag/put'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include("File argument 'object data' is required")
      })

      it('adds a dag-cbor node by default', async () => {
        const node = {
          foo: 'bar'
        }

        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/dag/put',
          ...await toHeadersAndPayload(JSON.stringify(node))
        })

        expect(res.statusCode).to.equal(200)

        const cid = new CID(res.result.Cid['/'])

        expect(cid.codec).to.equal('dag-cbor')

        const added = await http.api._ipfs.dag.get(cid)

        expect(added.value).to.deep.equal(node)
      })

      it('adds a dag-pb node', async () => {
        const node = {
          data: [],
          links: []
        }

        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/dag/put?format=dag-pb',
          ...await toHeadersAndPayload(JSON.stringify(node))
        })

        expect(res.statusCode).to.equal(200)

        const cid = new CID(res.result.Cid['/'])

        expect(cid.codec).to.equal('dag-pb')

        const added = await http.api._ipfs.dag.get(cid)

        expect(added.value.data).to.be.empty()
        expect(added.value.links).to.be.empty()
      })

      it('adds a raw node', async () => {
        const node = Buffer.from([0, 1, 2, 3])

        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/dag/put?format=raw',
          ...await toHeadersAndPayload(node)
        })

        expect(res.statusCode).to.equal(200)

        const cid = new CID(res.result.Cid['/'])

        expect(cid.codec).to.equal('raw')

        const added = await http.api._ipfs.dag.get(cid)

        expect(added.value).to.deep.equal(node)
      })

      it('pins a node after adding', async () => {
        const node = {
          foo: 'bar',
          disambiguator: Math.random()
        }

        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/dag/put?pin=true',
          ...await toHeadersAndPayload(JSON.stringify(node))
        })

        expect(res.statusCode).to.equal(200)

        const cid = new CID(res.result.Cid['/'])
        const pinset = await http.api._ipfs.pin.ls()

        expect(pinset.map(pin => pin.hash)).to.contain(cid.toBaseEncodedString('base58btc'))
      })

      it('does not pin a node after adding', async () => {
        const node = {
          foo: 'bar',
          disambiguator: Math.random()
        }

        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/dag/put?pin=false',
          ...await toHeadersAndPayload(JSON.stringify(node))
        })

        expect(res.statusCode).to.equal(200)

        const cid = new CID(res.result.Cid['/'])
        const pinset = await http.api._ipfs.pin.ls()

        expect(pinset.map(pin => pin.hash)).to.not.contain(cid.toBaseEncodedString('base58btc'))
      })
    })

    describe('/dag/resolve', () => {
      it('returns error for request without argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/dag/resolve'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('argument "ref" is required')
      })

      it('resolves a node', async () => {
        const node = {
          foo: 'bar'
        }
        const cid = await http.api._ipfs.dag.put(node, {
          format: 'dag-cbor',
          hashAlg: 'sha2-256'
        })

        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/dag/resolve?arg=${cid.toBaseEncodedString()}`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.be.ok()

        const returnedCid = new CID(res.result.Cid['/'])
        const returnedRemainerPath = res.result.RemPath

        expect(returnedCid).to.deep.equal(cid)
        expect(returnedRemainerPath).to.be.empty()
      })

      it('returns the remainder path from within the resolved node', async () => {
        const node = {
          foo: 'bar'
        }
        const cid = await http.api._ipfs.dag.put(node, {
          format: 'dag-cbor',
          hashAlg: 'sha2-256'
        })

        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/dag/resolve?arg=${cid.toBaseEncodedString()}/foo`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.be.ok()

        const returnedCid = new CID(res.result.Cid['/'])
        const returnedRemainerPath = res.result.RemPath

        expect(returnedCid).to.deep.equal(cid)
        expect(returnedRemainerPath).to.equal('foo')
      })

      it('returns an error when the path is not available', async () => {
        const node = {
          foo: 'bar'
        }
        const cid = await http.api._ipfs.dag.put(node, {
          format: 'dag-cbor',
          hashAlg: 'sha2-256'
        })

        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/dag/resolve?arg=${cid.toBaseEncodedString()}/bar`
        })

        expect(res.statusCode).to.equal(500)
        expect(res.result).to.be.ok()
      })

      it('resolves across multiple nodes, returning the CID of the last node traversed', async () => {
        const node2 = {
          bar: 'baz'
        }
        const cid2 = await http.api._ipfs.dag.put(node2, {
          format: 'dag-cbor',
          hashAlg: 'sha2-256'
        })

        const node1 = {
          foo: {
            '/': cid2
          }
        }

        const cid1 = await http.api._ipfs.dag.put(node1, {
          format: 'dag-cbor',
          hashAlg: 'sha2-256'
        })

        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/dag/resolve?arg=${cid1.toBaseEncodedString()}/foo/bar`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.be.ok()

        const returnedCid = new CID(res.result.Cid['/'])
        const returnedRemainerPath = res.result.RemPath

        expect(returnedCid).to.deep.equal(cid2)
        expect(returnedRemainerPath).to.equal('bar')
      })
    })
  })
}
