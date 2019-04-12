/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const expect = require('chai').expect
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const multibase = require('multibase')

// We use existing pin structure in the go-ipfs-repo fixture
// so that we don't have to stream a bunch of object/put operations
// This is suitable because these tests target the functionality
// of the /pin endpoints and don't delve into the pin core
//
// fixture's pins:
// - root1
//   - c1
//   - c2
//   - c3
//   - c4
//   - c5
//   - c6

const pins = {
  root1: 'QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr',
  c1: 'QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V',
  c2: 'QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y',
  c3: 'QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7',
  c4: 'QmQN88TEidd3RY2u3dpib49fERTDfKtDpvxnvczATNsfKT',
  c5: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
  c6: 'QmciSU8hfpAXKjvK5YLUSwApomGSWN5gFbP4EpDAEzu2Te'
}

module.exports = (http) => {
  describe('pin', function () {
    this.timeout(20 * 1000)
    let api

    before(() => {
      api = http.api._httpApi._apiServers[0]
    })

    describe('rm', () => {
      it('fails on invalid args', async () => {
        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/pin/rm?arg=invalid`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.match(/invalid ipfs ref path/)
      })

      it('unpins recursive pins', async () => {
        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/pin/rm?arg=${pins.root1}`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Pins).to.deep.eql([pins.root1])
      })

      it('unpins direct pins', async () => {
        let res = await api.inject({
          method: 'POST',
          url: `/api/v0/pin/add?arg=${pins.root1}&recursive=false`
        })

        expect(res.statusCode).to.equal(200)

        res = await api.inject({
          method: 'POST',
          url: `/api/v0/pin/rm?arg=${pins.root1}&recursive=false`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Pins).to.deep.eql([pins.root1])
      })

      it('should remove pin and return base64 encoded CID', async () => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/add',
          headers: headers,
          payload: payload
        })

        expect(res.statusCode).to.equal(200)
        const hash = JSON.parse(res.result).Hash

        res = await api.inject({
          method: 'POST',
          url: `/api/v0/pin/rm?arg=${hash}&cid-base=base64`
        })

        expect(res.statusCode).to.equal(200)
        res.result.Pins.forEach(cid => {
          expect(multibase.isEncoded(cid)).to.deep.equal('base64')
        })
      })

      it('should not remove pin for invalid cid-base option', async () => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/add',
          headers: headers,
          payload: payload
        })

        expect(res.statusCode).to.equal(200)
        const hash = JSON.parse(res.result).Hash

        res = await api.inject({
          method: 'POST',
          url: `/api/v0/pin/rm?arg=${hash}&cid-base=invalid`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })

    describe('add', () => {
      it('fails on invalid args', async () => {
        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/pin/add?arg=invalid`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.match(/invalid ipfs ref path/)
      })

      it('recursively', async () => {
        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/pin/add?arg=${pins.root1}`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Pins).to.deep.eql([pins.root1])
      })

      it('directly', async () => {
        const res = await api.inject({
          method: 'POST',
          url: `/api/v0/pin/add?arg=${pins.root1}&recursive=false`
        })
        // by directly pinning a node that is already recursively pinned,
        // it should error and verifies that the endpoint is parsing
        // the recursive arg correctly.
        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.match(/already pinned recursively/)
      })

      it('should add pin and return base64 encoded CID', async () => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/add?pin=false',
          headers: headers,
          payload: payload
        })

        expect(res.statusCode).to.equal(200)
        const hash = JSON.parse(res.result).Hash

        res = await api.inject({
          method: 'POST',
          url: `/api/v0/pin/add?arg=${hash}&cid-base=base64`
        })

        expect(res.statusCode).to.equal(200)
        res.result.Pins.forEach(cid => {
          expect(multibase.isEncoded(cid)).to.deep.equal('base64')
        })
      })

      it('should not add pin for invalid cid-base option', async () => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/add?pin=false',
          headers: headers,
          payload: payload
        })
        expect(res.statusCode).to.equal(200)
        const hash = JSON.parse(res.result).Hash

        res = await api.inject({
          method: 'POST',
          url: `/api/v0/pin/add?arg=${hash}&cid-base=invalid`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })

    describe('ls', () => {
      it('fails on invalid args', async () => {
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/pin/ls?arg=invalid`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.match(/invalid ipfs ref path/)
      })

      it('finds all pinned objects', async () => {
        const res = await api.inject({
          method: 'GET',
          url: '/api/v0/pin/ls'
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Keys).to.include.all.keys(Object.values(pins))
      })

      it('finds specific pinned objects', async () => {
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/pin/ls?arg=${pins.c1}`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Keys[pins.c1].Type)
          .to.equal(`indirect through ${pins.root1}`)
      })

      it('finds pins of type', async () => {
        const res = await api.inject({
          method: 'GET',
          url: `/api/v0/pin/ls?type=recursive`
        })

        expect(res.statusCode).to.equal(200)
        expect(res.result.Keys['QmfGBRT6BbWJd7yUc2uYdaUZJBbnEFvTqehPFoSMQ6wgdr'])
          .to.deep.eql({ Type: 'recursive' })
      })

      it('should list pins and return base64 encoded CIDs', async () => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/add',
          headers: headers,
          payload: payload
        })
        expect(res.statusCode).to.equal(200)

        res = await api.inject({
          method: 'POST',
          url: `/api/v0/pin/ls?cid-base=base64`
        })

        expect(res.statusCode).to.equal(200)
        Object.keys(res.result.Keys).forEach(cid => {
          expect(multibase.isEncoded(cid)).to.deep.equal('base64')
        })
      })

      it('should not list pins for invalid cid-base option', async () => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        const payload = await streamToPromise(form)
        let res = await api.inject({
          method: 'POST',
          url: '/api/v0/add',
          headers: headers,
          payload: payload
        })
        expect(res.statusCode).to.equal(200)

        res = await api.inject({
          method: 'POST',
          url: `/api/v0/pin/ls?cid-base=invalid`
        })

        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.include('Invalid request query input')
      })
    })
  })
}
