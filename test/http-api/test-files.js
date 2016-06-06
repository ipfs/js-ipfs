/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const APIctl = require('ipfs-api')

module.exports = (httpAPI) => {
  describe('files', () => {
    describe('api', () => {
      let api

      before(() => {
        api = httpAPI.server.select('API')
      })

      describe('/files/cat', () => {
        it('returns 400 for request without argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/cat'
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result).to.be.a('string')
            done()
          })
        })

        it('returns 500 for request with invalid argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/cat?arg=invalid'
          }, (res) => {
            expect(res.statusCode).to.equal(500)
            expect(res.result.Message).to.be.a('string')
            done()
          })
        })

        it('returns a buffer', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/cat?arg=QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.rawPayload).to.deep.equal(new Buffer('hello world' + '\n'))
            expect(res.payload).to.equal('hello world' + '\n')
            done()
          })
        })
      })
    })

    describe('using js-ipfs-api', () => {
      var ctl

      it('start IPFS API ctl', (done) => {
        ctl = APIctl('/ip4/127.0.0.1/tcp/6001')
        done()
      })

      describe('ipfs.cat', () => {
        it('returns error for request without argument', (done) => {
          ctl.cat(null, (err, result) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns error for request with invalid argument', (done) => {
          ctl.cat('invalid', (err, result) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns a buffer', (done) => {
          ctl.cat('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o', (err, result) => {
            expect(err).to.not.exist
            expect(result).to.deep.equal(new Buffer('hello world' + '\n'))
            done()
          })
        })
      })
    })
  })
}
