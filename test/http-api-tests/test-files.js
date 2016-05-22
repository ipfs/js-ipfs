/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const APIctl = require('ipfs-api')

const fs = require('fs')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const Readable = require('stream').Readable
const http = require('http')

function singleFileServer (filename) {
  return http.createServer(function (req, res) {
    fs.createReadStream(filename).pipe(res)
  })
}


module.exports = (httpAPI) => {
  describe('files', () => {
    describe('api', () => {
      let api

      it('api', () => {
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

  describe('files', () => {
    describe('api', () => {
      let api

      it('api', () => {
        api = httpAPI.server.select('API')
      })

      describe('/files/add', () => {
        it('returns 400 if no tuple is provided', (done) => {
          const form = new FormData()
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/add',
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(400)
              done()
            })
          })
        })

        it('adds a file', (done) => {
          const form = new FormData()
          const filePath = 'test/test-data/node.json'
          form.append('file', fs.createReadStream(filePath))
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/add',
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(200)
              var result = JSON.parse(res.result)
              expect(result.Name).to.equal('node.json')
              expect(result.Hash).to.equal('QmRRdjTN2PjyEPrW73GBxJNAZrstH5tCZzwHYFJpSTKkhe')
              done()
            })
          })
        })

        it('adds multiple files', (done) => {
          const form = new FormData()
          const filePath = 'test/test-data/hello'
          const filePath2 = 'test/test-data/otherconfig'
          form.append('file', fs.createReadStream(filePath))
          form.append('file', fs.createReadStream(filePath2))
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/add',
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(200)
              var results = res.result.split('\n').slice(0, -1).map(JSON.parse)
              expect(results[0].Name).to.equal('hello')
              expect(results[0].Hash).to.equal('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
              expect(results[1].Name).to.equal('otherconfig')
              expect(results[1].Hash).to.equal('QmayedZNznnEbHtyfjeQvvt29opSLjYjLtLqwfwSWq28ds')
              done()
            })
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

      describe('ipfs.add', () => {
        it('adds two files under a chunk Size', (done) => {
          const rs = new Readable()
          const rs2 = new Readable()
          var files = []
          const buffered = fs.readFileSync('test/test-data/hello')
          const buffered2 = fs.readFileSync('test/test-data/otherconfig')
          rs.push(buffered)
          rs.push(null)
          rs2.push(buffered2)
          rs2.push(null)
          const filePair = {path: 'hello', content: rs}
          const filePair2 = {path: 'otherconfig', content: rs2}
          files.push(filePair)
          files.push(filePair2)

          ctl.add(files, (err, res) => {
            expect(err).to.not.exist
            expect(res[0].Name).to.equal('hello')
            expect(res[0].Hash).to.equal('QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o')
            expect(res[1].Name).to.equal('otherconfig')
            expect(res[1].Hash).to.equal('QmayedZNznnEbHtyfjeQvvt29opSLjYjLtLqwfwSWq28ds')
            done()
          })
        })

        it('adds a large file > a chunk', (done) => {
          const rs = new Readable()
          var files = []
          const buffered = fs.readFileSync('test/test-data/1.2MiB.txt')
          rs.push(buffered)
          rs.push(null)
          const filePair = {path: '1.2MiB.txt', content: rs}
          files.push(filePair)

          ctl.add(filePair, (err, res) => {
            expect(err).to.not.exist
            expect(res[0].Name).to.equal('1.2MiB.txt')
            expect(res[0].Hash).to.equal('QmW7BDxEbGqxxSYVtn3peNPQgdDXbWkoQ6J1EFYAEuQV3Q')
            done()
          })
        })

        it('adds a buffer', (done) => {
          const buffer = new Buffer('hello world')
          ctl.add(buffer, (err, res) => {
            expect(err).to.not.exist
            expect(res[0].Hash).to.equal('Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD')
            done()
          })
        })

        it('adds a url', (done) => {
          var server = singleFileServer('test/test-data/1.2MiB.txt')
          server.listen(2913, function () {
            ctl.add('http://localhost:2913/', (err, res) => {
              expect(err).to.not.exist
              const added = res[0] != null ? res[0] : res
              expect(added).to.have.a.property('Hash', 'QmW7BDxEbGqxxSYVtn3peNPQgdDXbWkoQ6J1EFYAEuQV3Q')
              done()
            })
          })
        })
      })
    })
  })
}
