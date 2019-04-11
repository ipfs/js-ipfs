/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const fs = require('fs')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const multibase = require('multibase')

module.exports = (http) => {
  describe('/object', () => {
    let api

    before('api', () => {
      api = http.api._httpApi._apiServers[0]
    })

    describe('/new', () => {
      it('returns value', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Hash)
          .to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
        expect(res.result.Links).to.be.eql([])
      })

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should create a new object and return a base64 encoded CID', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new?cid-base=base64'
        })

        expect(res.statusCode).to.equal(200)
        expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
      })

      it('should not create a new object for invalid cid-base option', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new?cid-base=invalid'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })

    describe('/get', () => {
      it('returns 400 for request without argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/get'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with invalid argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/get?arg=invalid'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.equal(1)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns value', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/get?arg=QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Links).to.eql([])
        expect(res.result.Data).to.be.empty()
      })

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should get object and return a base64 encoded CID', async () => {
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })

        expect(res.statusCode).to.equal(200)

        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/get?cid-base=base64&arg=' + res.result.Hash
        })

        expect(res.statusCode).to.equal(200)
        expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
      })

      it('should not get an object for invalid cid-base option', async () => {
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })
        expect(res.statusCode).to.equal(200)

        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/get?cid-base=invalid&arg=' + res.result.Hash
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })

    describe('/put', () => {
      it('returns 400 if no node is provided', async () => {
        const form = new FormData()
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/put',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(400)
      })

      it('returns 400 if the node is invalid', async () => {
        const form = new FormData()
        const filePath = 'test/fixtures/test-data/badnode.json'
        form.append('file', fs.createReadStream(filePath))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/put',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(400)
      })

      it('updates value', async () => {
        const form = new FormData()
        const filePath = 'test/fixtures/test-data/node.json'
        form.append('data', fs.createReadStream(filePath))
        const headers = form.getHeaders()

        const expectedResult = {
          Data: Buffer.from('another'),
          Hash: 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm',
          Links: [{
            Name: 'some link',
            Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
            Size: 8
          }],
          Size: 68
        }

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/put',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.eql(expectedResult)
      })

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should put data and return a base64 encoded CID', async () => {
        const form = new FormData()
        form.append('file', JSON.stringify({ Data: 'TEST' + Date.now(), Links: [] }), { filename: 'node.json' })
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/put?cid-base=base64',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
      })

      it('should not put data for invalid cid-base option', async () => {
        const form = new FormData()
        form.append('file', JSON.stringify({ Data: 'TEST' + Date.now(), Links: [] }), { filename: 'node.json' })
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/put?cid-base=invalid',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })

    describe('/stat', () => {
      it('returns 400 for request without argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/stat'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with invalid argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/stat?arg=invalid'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.equal(1)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns value', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/stat?arg=QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Hash).to.equal('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
        expect(res.result.NumLinks).to.equal(1)
        expect(res.result.BlockSize).to.equal(60)
        expect(res.result.LinksSize).to.equal(60 - 7)
        expect(res.result.DataSize).to.equal(7)
        expect(res.result.CumulativeSize).to.equal(60 + 8)
      })

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should stat object and return a base64 encoded CID', async () => {
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })

        expect(res.statusCode).to.equal(200)

        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/stat?cid-base=base64&arg=' + res.result.Hash
        })

        expect(res.statusCode).to.equal(200)
        expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
      })

      it('should not stat object for invalid cid-base option', async () => {
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })

        expect(res.statusCode).to.equal(200)

        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/stat?cid-base=invalid&arg=' + res.result.Hash
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })

    describe('/data', () => {
      it('returns 400 for request without argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/data'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with invalid argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/data?arg=invalid'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.equal(1)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns value', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/data?arg=QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.equal('another')
      })
    })

    describe('/links', () => {
      it('returns 400 for request without argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/links'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with invalid argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/links?arg=invalid'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.equal(1)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns value', async () => {
        const expectedResult = {
          Hash: 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm',
          Links: [
            { Name: 'some link', Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V', Size: 8 }
          ]
        }

        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/links?arg=QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.deep.equal(expectedResult)
      })

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should list object links and return a base64 encoded CID', async () => {
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })

        expect(res.statusCode).to.equal(200)
        const linkHash = res.result.Hash

        const form = new FormData()
        form.append('file', JSON.stringify({
          Data: 'TEST' + Date.now(),
          Links: [{ Name: 'emptyNode', Hash: linkHash, Size: 8 }]
        }), { filename: 'node.json' })
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/put',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        const hash = res.result.Hash

        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/links?cid-base=base64&arg=' + hash
        })

        expect(res.statusCode).to.equal(200)
        expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
        expect(res.result.Links).to.have.length(1)
        expect(multibase.isEncoded(res.result.Links[0].Hash)).to.deep.equal('base64')
      })

      it('should not list object links for invalid cid-base option', async () => {
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })

        expect(res.statusCode).to.equal(200)
        const linkHash = res.result.Hash

        const form = new FormData()
        form.append('file', JSON.stringify({
          Data: 'TEST' + Date.now(),
          Links: [{ Name: 'emptyNode', Hash: linkHash, Size: 8 }]
        }), { filename: 'node.json' })
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/put',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        const hash = res.result.Hash

        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/links?cid-base=invalid&arg=' + hash
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })

    describe('/patch/append-data', () => {
      it('returns 400 for request without key', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/append-data'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 if no data is provided', async () => {
        const form = new FormData()
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/append-data?arg=QmVLUHkjGg3duGb5w3dnwK5w2P9QWuJmtVNuDPLc9ZDjzk',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(400)
      })

      it('returns 400 for request with invalid key', async () => {
        const form = new FormData()
        const filePath = 'test/fixtures/test-data/badconfig'
        form.append('file', fs.createReadStream(filePath))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/append-data?arg=invalid',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(400)
      })

      it('updates value', async () => {
        const form = new FormData()
        const filePath = 'test/fixtures/test-data/badconfig'
        form.append('data', fs.createReadStream(filePath))
        const headers = form.getHeaders()
        const expectedResult = {
          Data: fs.readFileSync(filePath),
          Hash: 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6',
          Links: [],
          Size: 19
        }

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/append-data?arg=QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.deep.equal(expectedResult)
      })

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should append data to object and return a base64 encoded CID', async () => {
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })

        expect(res.statusCode).to.equal(200)

        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/append-data?cid-base=base64&arg=' + res.result.Hash,
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
      })

      it('should not append data to object for invalid cid-base option', async () => {
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })

        expect(res.statusCode).to.equal(200)

        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/append-data?cid-base=invalid&arg=' + res.result.Hash,
          headers,
          payload
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })

    describe('/patch/set-data', () => {
      it('returns 400 for request without key', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/set-data'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 if no data is provided', async () => {
        const form = new FormData()
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/set-data?arg=QmVLUHkjGg3duGb5w3dnwK5w2P9QWuJmtVNuDPLc9ZDjzk',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(400)
      })

      it('returns 400 for request with invalid key', async () => {
        const form = new FormData()
        const filePath = 'test/fixtures/test-data/badconfig'
        form.append('file', fs.createReadStream(filePath))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/set-data?arg=invalid',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(400)
      })

      it('updates value', async () => {
        const form = new FormData()
        const filePath = 'test/fixtures/test-data/badconfig'
        form.append('data', fs.createReadStream(filePath))
        const headers = form.getHeaders()
        const expectedResult = {
          Hash: 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6',
          Links: []
        }

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/set-data?arg=QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result).to.deep.equal(expectedResult)
      })

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should set data for object and return a base64 encoded CID', async () => {
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })
        expect(res.statusCode).to.equal(200)

        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/set-data?cid-base=base64&arg=' + res.result.Hash,
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
      })

      it('should not set data for object for invalid cid-base option', async () => {
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })

        expect(res.statusCode).to.equal(200)

        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/set-data?cid-base=invalid&arg=' + res.result.Hash,
          headers,
          payload
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })

    describe('/patch/add-link', () => {
      it('returns 400 for request without arguments', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/add-link'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with only one invalid argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/add-link?arg=invalid'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with invalid first argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/add-link?arg=&arg=foo&arg=QmTz3oc4gdpRMKP2sdGUPZTAGRngqjsi99BPoztyP53JMM'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.equal(1)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with empty second argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/add-link?arg=QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn&arg=&arg=QmTz3oc4gdpRMKP2sdGUPZTAGRngqjsi99BPoztyP53JMM'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.equal(1)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns value', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/add-link?arg=QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n&arg=foo&arg=QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Hash).to.equal('QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK')
        expect(res.result.Links[0]).to.deep.equal({
          Name: 'foo',
          Hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
          Size: 4
        })
      })

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should add a link to an object and return a base64 encoded CID', async () => {
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })

        expect(res.statusCode).to.equal(200)

        res = await api.inject({
          method: 'POST',
          url: `/api/v0/object/patch/add-link?cid-base=base64&arg=${res.result.Hash}&arg=test&arg=${res.result.Hash}`
        })

        expect(res.statusCode).to.equal(200)
        expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
      })

      it('should not add a link to an object for invalid cid-base option', async () => {
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })

        expect(res.statusCode).to.equal(200)

        res = await api.inject({
          method: 'POST',
          url: `/api/v0/object/patch/add-link?cid-base=invalid&arg=${res.result.Hash}&arg=test&arg=${res.result.Hash}`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })

    describe('/patch/rm-link', () => {
      it('returns 400 for request without arguments', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/rm-link'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with only one invalid argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/rm-link?arg=invalid'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with invalid first argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/rm-link?arg=invalid&arg=foo'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.equal(1)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with invalid second argument', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/rm-link?arg=QmZKetgwm4o3LhNaoLSHv32wBhTwj9FBwAdSchDMKyFQEx&arg='
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Code).to.equal(1)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns value', async () => {
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/rm-link?arg=QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK&arg=foo'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Hash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
      })

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should remove a link from an object and return a base64 encoded CID', async () => {
        const linkName = 'TEST' + Date.now()

        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })

        expect(res.statusCode).to.equal(200)
        const linkHash = res.result.Hash

        const form = new FormData()
        form.append('file', JSON.stringify({
          Data: 'TEST' + Date.now(),
          Links: [{ Name: linkName, Hash: linkHash, Size: 8 }]
        }), { filename: 'node.json' })
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/put',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        const hash = res.result.Hash

        res = await api.inject({
          method: 'POST',
          url: `/api/v0/object/patch/rm-link?cid-base=base64&arg=${hash}&arg=${linkName}`
        })

        expect(res.statusCode).to.equal(200)
        expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
      })

      it('should not remove a link from an object for invalid cid-base option', async () => {
        const linkName = 'TEST' + Date.now()

        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        })

        expect(res.statusCode).to.equal(200)
        const linkHash = res.result.Hash

        const form = new FormData()
        form.append('file', JSON.stringify({
          Data: 'TEST' + Date.now(),
          Links: [{ Name: linkName, Hash: linkHash, Size: 8 }]
        }), { filename: 'node.json' })
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        res = await api.inject({
          method: 'POST',
          url: '/api/v0/object/put',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        const hash = res.result.Hash

        res = await api.inject({
          method: 'POST',
          url: `/api/v0/object/patch/rm-link?cid-base=invalid&arg=${hash}&arg=${linkName}`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })
  })
}
