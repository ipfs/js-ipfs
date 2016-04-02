/* eslint-env mocha */

const expect = require('chai').expect
const APIctl = require('ipfs-api')
const fs = require('fs')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')

describe('block', () => {
  describe('api', () => {
    var api

    it('api', (done) => {
      api = require('../../src/http-api').server.select('API')
      done()
    })

    describe('/block/put', () => {
      it('returns 400 if no node is provided', (done) => {
        const form = new FormData()
        const headers = form.getHeaders()

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/block/put',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            done()
          })
        })
      })

      it('updates value', (done) => {
        const form = new FormData()
        const filePath = 'test/test-data/hello'
        form.append('data', fs.createReadStream(filePath))
        const headers = form.getHeaders()
        const expectedResult = {
          Key: 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp',
          Size: 12
        }

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/block/put',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result).to.deep.equal(expectedResult)
            done()
          })
        })
      })
    })

    describe('/block/get', () => {
      it('returns 400 for request without argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/get'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 500 for request with invalid argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/get?arg=invalid'
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.equal(0)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('returns value', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/get?arg=QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result)
            .to.equal('hello world\n')
          done()
        })
      })
    })

    describe('/block/stat', () => {
      it('returns 400 for request without argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/stat'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 500 for request with invalid argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/stat?arg=invalid'
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.equal(0)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('returns value', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/stat?arg=QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Key)
            .to.equal('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(res.result.Size).to.equal(12)
          done()
        })
      })
    })

    describe('/block/del', () => {
      it('returns 400 for request without argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/del'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 500 for request with invalid argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/del?arg=invalid'
        }, (res) => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Code).to.equal(0)
          expect(res.result.Message).to.be.a('string')
          done()
        })
      })

      it('returns 200', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/block/del?arg=QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
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

    describe('ipfs.block.put', () => {
      it('returns error for request without argument', (done) => {
        const filePath = null

        ctl.block.put(filePath, (err) => {
          expect(err).to.exist
          done()
        })
      })

      it('updates value', (done) => {
        const filePath = 'test/test-data/hello'
        const expectedResult = {
          Key: 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp',
          Size: 12
        }

        ctl.block.put(filePath, (err, res) => {
          expect(err).not.to.exist
          expect(res).to.deep.equal(expectedResult)
          done()
        })
      })
    })

    describe('ipfs.block.get', () => {
      it('returns error for request without argument', (done) => {
        ctl.block.get(null, (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns error for request with invalid argument', (done) => {
        ctl.block.get('invalid', (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns value', (done) => {
        ctl.block.get('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', (err, result) => {
          expect(err).to.not.exist
          expect(result.toString())
            .to.equal('hello world\n')
          done()
        })
      })
    })

    describe('ipfs.block.stat', () => {
      it('returns error for request without argument', (done) => {
        ctl.block.stat(null, (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns error for request with invalid argument', (done) => {
        ctl.block.stat('invalid', (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns value', (done) => {
        ctl.block.stat('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', (err, result) => {
          expect(err).to.not.exist
          expect(result.Key)
            .to.equal('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(result.Size).to.equal(12)
          done()
        })
      })
    })
  })
})
