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
      api = http.api.server.select('API')
    })

    describe('/add', () => {
      it('should add buffer bigger than Hapi default max bytes (1024 * 1024)', (done) => {
        const payload = Buffer.from([
          '',
          '------------287032381131322',
          'Content-Disposition: form-data; name="test"; filename="test.txt"',
          'Content-Type: text/plain',
          '',
          crypto.randomBytes(1024 * 1024 * 2).toString('hex'),
          '------------287032381131322--'
        ].join('\r\n'))

        api.inject({
          method: 'POST',
          url: '/api/v0/add',
          headers: {
            'Content-Type': 'multipart/form-data; boundary=----------287032381131322'
          },
          payload
        }, (res) => {
          expect(res.statusCode).to.not.equal(413) // Payload too large
          expect(res.statusCode).to.equal(200)
          done()
        })
      })

      // TODO: unskip when we can retrieve data from the repo with a different
      // version CID then it was added with.
      it.skip('should add data and return a base64 encoded CID', (done) => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/add?cid-base=base64',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(multibase.isEncoded(JSON.parse(res.result).Hash)).to.deep.equal('base64')
            done()
          })
        })
      })

      it('should add data without pinning and return a base64 encoded CID', (done) => {
        const form = new FormData()
        form.append('data', Buffer.from('TEST' + Date.now()))
        const headers = form.getHeaders()

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/add?cid-base=base64&pin=false',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(multibase.isEncoded(JSON.parse(res.result).Hash)).to.deep.equal('base64')
            done()
          })
        })
      })
    })

    describe('/cat', () => {
      it('returns 400 for request without argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/cat'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('500 for request with invalid argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/cat?arg=invalid'
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('valid hash', function (done) {
        this.timeout(90 * 1000)
        api.inject({
          method: 'GET',
          url: '/api/v0/cat?arg=QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.rawPayload).to.deep.equal(Buffer.from('hello world' + '\n'))
          expect(res.payload).to.equal('hello world' + '\n')
          done()
        })
      })
    })

    describe('/get', () => {}) // TODO

    describe('/ls', () => {
      it('should list directory contents and return a base64 encoded CIDs', (done) => {
        const form = new FormData()
        form.append('file', Buffer.from('TEST' + Date.now()), { filename: 'data.txt' })
        const headers = form.getHeaders()

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/add?wrap-with-directory=true',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(200)

            const files = res.result.trim().split('\n').map(r => JSON.parse(r))
            const dir = files[files.length - 1]

            api.inject({
              method: 'POST',
              url: '/api/v0/ls?cid-base=base64&arg=' + dir.Hash
            }, (res) => {
              expect(res.statusCode).to.equal(200)
              res.result.Objects[0].Links.forEach(item => {
                expect(multibase.isEncoded(item.Hash)).to.deep.equal('base64')
              })
              done()
            })
          })
        })
      })
    })
  })
}
