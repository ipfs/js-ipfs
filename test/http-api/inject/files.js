/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const crypto = require('crypto')
const expect = require('chai').expect
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const multibase = require('multibase')

module.exports = (http) => {
  describe('/files', () => {
    let api

    before(() => {
      api = http.api._httpApi._apiServers[0]
    })

    describe('/add', () => {
      it('should add buffer bigger than Hapi default max bytes (1024 * 1024)', async () => {
        const payload = Buffer.from([
          '',
          '------------287032381131322',
          'Content-Disposition: form-data; name="test"; filename="test.txt"',
          'Content-Type: text/plain',
          '',
          crypto.randomBytes(1024 * 1024 * 2).toString('hex'),
          '------------287032381131322--'
        ].join('\r\n'))

        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/add',
          headers: {
            'Content-Type': 'multipart/form-data; boundary=----------287032381131322'
          },
          payload
        })

        expect(res.statusCode).to.not.equal(413) // Payload too large
        expect(res.statusCode).to.equal(200)
      })

      // TODO: unskip when we can retrieve data from the repo with a different
      // version CID then it was added with.
      it.skip('should add data and return a base64 encoded CID', async () => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/add?cid-base=base64',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        expect(multibase.isEncoded(JSON.parse(res.result).Hash)).to.deep.equal('base64')
      })

      it('should add data without pinning and return a base64 encoded CID', async () => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        const res = await api.inject({
          method: 'POST',
          url: '/api/v0/add?cid-base=base64&pin=false',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        expect(multibase.isEncoded(JSON.parse(res.result).Hash)).to.deep.equal('base64')
      })
    })

    describe('/cat', () => {
      it('returns 400 for request without argument', async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/cat'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('returns 400 for request with invalid argument', async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/cat?arg=invalid'
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
      })

      it('should cat a valid hash', async function () {
        this.timeout(30 * 1000)

        const data = Buffer.from('TEST' + Date.now())
        const form = new FormData()
        form.append('data', data)
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/add',
          headers,
          payload
        })

        expect(res.statusCode).to.equal(200)
        const cid = JSON.parse(res.result).Hash

        res = await api.inject({
          method: 'GET',
          url: '/api/v0/cat?arg=' + cid
        })

        expect(res.statusCode).to.equal(200)
        expect(res.rawPayload).to.deep.equal(data)
        expect(res.payload).to.equal(data.toString())
      })
    })

    describe('/get', () => {}) // TODO

    describe('/ls', () => {
      it('should list directory contents and return a base64 encoded CIDs', async () => {
        const form = new FormData()
        form.append('file', Buffer.from('TEST' + Date.now()), { filename: 'data.txt' })
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/add?wrap-with-directory=true',
          headers,
          payload
        })
        expect(res.statusCode).to.equal(200)

        const files = res.result.trim().split('\n').map(r => JSON.parse(r))
        const dir = files[files.length - 1]

        res = await api.inject({
          method: 'POST',
          url: '/api/v0/ls?cid-base=base64&arg=' + dir.Hash
        })
        expect(res.statusCode).to.equal(200)
        res.result.Objects[0].Links.forEach(item => {
          expect(multibase.isEncoded(item.Hash)).to.deep.equal('base64')
        })
      })
    })

    describe('/refs', () => {
      it('should list refs', async () => {
        const form = new FormData()
        form.append('file', Buffer.from('TEST' + Date.now()), { filename: 'data.txt' })
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/add?wrap-with-directory=true',
          headers,
          payload
        })
        expect(res.statusCode).to.equal(200)

        const files = res.result.trim().split('\n').map(r => JSON.parse(r))
        const dir = files[files.length - 1]

        res = await api.inject({
          method: 'POST',
          url: '/api/v0/refs?format=<linkname>&arg=' + dir.Hash
        })
        expect(res.statusCode).to.equal(200)
        expect(res.result.length).to.equal(1)
        expect(res.result[0].Ref).to.equal('data.txt')
      })
    })
  })
}
