/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const APIctl = require('ipfs-api')
const fs = require('fs')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const DAGLink = require('ipfs-merkle-dag').DAGLink

module.exports = (httpAPI) => {
  describe('object', () => {
    describe('api', () => {
      let api

      it('api', () => {
        api = httpAPI.server.select('API')
      })

      describe('/object/new', () => {
        it('returns value', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/new'
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result.Hash)
              .to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
            expect(res.result.Links).to.be.eql([])
            done()
          })
        })
      })

      describe('/object/get', () => {
        it('returns 400 for request without argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/get'
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result).to.be.a('string')
            done()
          })
        })

        it('returns 500 for request with invalid argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/get?arg=invalid'
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
            url: '/api/v0/object/get?arg=QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result.Links).to.be.eql([])
            expect(res.result.Data).to.be.empty
            done()
          })
        })
      })

      describe('/object/put', () => {
        it('returns 400 if no node is provided', (done) => {
          const form = new FormData()
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/put',
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(400)
              done()
            })
          })
        })

        it('returns 500 if the node is invalid', (done) => {
          const form = new FormData()
          const filePath = 'test/test-data/badnode.json'
          form.append('file', fs.createReadStream(filePath))
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/put',
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(500)
              done()
            })
          })
        })

        it('updates value', (done) => {
          const form = new FormData()
          const filePath = 'test/test-data/node.json'
          form.append('data', fs.createReadStream(filePath))
          const headers = form.getHeaders()
          const expectedResult = {
            Data: new Buffer('another'),
            Hash: 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm',
            Links: [{
              Name: 'some link',
              Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
              Size: 8
            }],
            Size: 68
          }

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/put',
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

      describe('/object/stat', () => {
        it('returns 400 for request without argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/stat'
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result).to.be.a('string')
            done()
          })
        })

        it('returns 500 for request with invalid argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/stat?arg=invalid'
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
            url: '/api/v0/object/stat?arg=QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result.Hash).to.equal('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
            expect(res.result.NumLinks).to.equal(1)
            expect(res.result.BlockSize).to.equal(60)
            expect(res.result.LinksSize).to.equal(60 - 7)
            expect(res.result.DataSize).to.equal(7)
            expect(res.result.CumulativeSize).to.equal(60 + 8)
            done()
          })
        })
      })

      describe('/object/data', () => {
        it('returns 400 for request without argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/data'
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result).to.be.a('string')
            done()
          })
        })

        it('returns 500 for request with invalid argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/data?arg=invalid'
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
            url: '/api/v0/object/data?arg=QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result).to.equal('another')
            done()
          })
        })
      })

      describe('/object/links', () => {
        it('returns 400 for request without argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/links'
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result).to.be.a('string')
            done()
          })
        })

        it('returns 500 for request with invalid argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/links?arg=invalid'
          }, (res) => {
            expect(res.statusCode).to.equal(500)
            expect(res.result.Code).to.equal(0)
            expect(res.result.Message).to.be.a('string')
            done()
          })
        })

        it('returns value', (done) => {
          const expectedResult = {
            Hash: 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm',
            Links: [
              { Name: 'some link', Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V', Size: 8 }
            ]
          }

          api.inject({
            method: 'GET',
            url: '/api/v0/object/links?arg=QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result).to.deep.equal(expectedResult)
            done()
          })
        })
      })

      describe('/object/patch/append-data', () => {
        it('returns 400 for request without key', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/patch/append-data'
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result).to.be.a('string')
            done()
          })
        })

        it('returns 400 if no data is provided', (done) => {
          const form = new FormData()
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/patch/append-data?arg=QmVLUHkjGg3duGb5w3dnwK5w2P9QWuJmtVNuDPLc9ZDjzk',
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(400)
              done()
            })
          })
        })

        it('returns 500 for request with invalid key', (done) => {
          const form = new FormData()
          const filePath = 'test/test-data/badconfig'
          form.append('file', fs.createReadStream(filePath))
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/patch/append-data?arg=invalid',
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(500)
              done()
            })
          })
        })

        it('updates value', (done) => {
          const form = new FormData()
          const filePath = 'test/test-data/badconfig'
          form.append('data', fs.createReadStream(filePath))
          const headers = form.getHeaders()
          const expectedResult = {
            Data: fs.readFileSync(filePath),
            Hash: 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6',
            Links: [],
            Size: 19
          }

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/patch/append-data?arg=QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n',
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

      describe('/object/patch/set-data', () => {
        it('returns 400 for request without key', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/patch/set-data'
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result).to.be.a('string')
            done()
          })
        })

        it('returns 400 if no data is provided', (done) => {
          const form = new FormData()
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/patch/set-data?arg=QmVLUHkjGg3duGb5w3dnwK5w2P9QWuJmtVNuDPLc9ZDjzk',
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(400)
              done()
            })
          })
        })

        it('returns 500 for request with invalid key', (done) => {
          const form = new FormData()
          const filePath = 'test/test-data/badconfig'
          form.append('file', fs.createReadStream(filePath))
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/patch/set-data?arg=invalid',
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(500)
              done()
            })
          })
        })

        it('updates value', (done) => {
          const form = new FormData()
          const filePath = 'test/test-data/badconfig'
          form.append('data', fs.createReadStream(filePath))
          const headers = form.getHeaders()
          const expectedResult = {
            Hash: 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6',
            Links: []
          }

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/patch/set-data?arg=QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6',
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

      describe('/object/patch/add-link', () => {
        it('returns 400 for request without arguments', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/patch/add-link'
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result).to.be.a('string')
            done()
          })
        })

        it('returns 400 for request with only one invalid argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/patch/add-link?arg=invalid'
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result).to.be.a('string')
            done()
          })
        })

        it('returns 500 for request with invalid first argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/patch/add-link?arg=&arg=foo&arg=QmTz3oc4gdpRMKP2sdGUPZTAGRngqjsi99BPoztyP53JMM'
          }, (res) => {
            expect(res.statusCode).to.equal(500)
            expect(res.result.Code).to.equal(0)
            expect(res.result.Message).to.be.a('string')
            done()
          })
        })

        it('returns 500 for request with empty second argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/patch/add-link?arg=QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn&arg=&arg=QmTz3oc4gdpRMKP2sdGUPZTAGRngqjsi99BPoztyP53JMM'
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
            url: '/api/v0/object/patch/add-link?arg=QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n&arg=foo&arg=QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result.Hash).to.equal('QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK')
            expect(res.result.Links[0]).to.deep.equal({
              Name: 'foo',
              Hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
              Size: 4
            })
            done()
          })
        })
      })

      describe('/object/patch/rm-link', () => {
        it('returns 400 for request without arguments', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/patch/rm-link'
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result).to.be.a('string')
            done()
          })
        })

        it('returns 400 for request with only one invalid argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/patch/rm-link?arg=invalid'
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result).to.be.a('string')
            done()
          })
        })

        it('returns 500 for request with invalid first argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/patch/rm-link?arg=invalid&arg=foo'
          }, (res) => {
            expect(res.statusCode).to.equal(500)
            expect(res.result.Code).to.equal(0)
            expect(res.result.Message).to.be.a('string')
            done()
          })
        })

        it('returns 500 for request with invalid second argument', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/object/patch/rm-link?arg=QmZKetgwm4o3LhNaoLSHv32wBhTwj9FBwAdSchDMKyFQEx&arg='
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
            url: '/api/v0/object/patch/rm-link?arg=QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK&arg=foo'
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result.Hash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
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

      it('ipfs.object.new', (done) => {
        ctl.object.new((err, result) => {
          expect(err).to.not.exist
          const res = result.toJSON()
          expect(res.Hash)
            .to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
          expect(res.Links).to.be.eql([])
          done()
        })
      })

      describe('ipfs.object.get', () => {
        it('returns error for request without argument', (done) => {
          ctl.object.get(null, (err, result) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns error for request with invalid argument', (done) => {
          ctl.object.get('invalid', {enc: 'base58'}, (err, result) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns value', (done) => {
          ctl.object.get('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n', {enc: 'base58'}, (err, result) => {
            expect(err).to.not.exist
            const res = result.toJSON()
            expect(res.Links).to.be.eql([])
            expect(res.Data).to.equal('')
            done()
          })
        })
      })

      describe('ipfs.object.put', () => {
        it('returns error if the node is invalid', (done) => {
          const filePath = 'test/test-data/badnode.json'

          ctl.object.put(filePath, {enc: 'json'}, (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('updates value', (done) => {
          const filePath = fs.readFileSync('test/test-data/node.json')
          const expectedResult = {
            Data: 'another',
            Hash: 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm',
            Links: [{
              Name: 'some link',
              Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
              Size: 8
            }],
            Size: 68
          }

          ctl.object.put(filePath, {enc: 'json'}, (err, res) => {
            expect(err).not.to.exist
            expect(res.toJSON()).to.deep.equal(expectedResult)
            done()
          })
        })
      })

      describe('ipfs.object.stat', () => {
        it('returns error for request without argument', (done) => {
          ctl.object.stat(null, (err, result) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns error for request with invalid argument', (done) => {
          ctl.object.stat('invalid', {enc: 'base58'}, (err, result) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns value', (done) => {
          ctl.object.stat('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm', {enc: 'base58'}, (err, result) => {
            expect(err).to.not.exist
            expect(result.Hash).to.equal('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
            expect(result.NumLinks).to.equal(1)
            expect(result.BlockSize).to.equal(60)
            expect(result.LinksSize).to.equal(60 - 7)
            expect(result.DataSize).to.equal(7)
            expect(result.CumulativeSize).to.equal(60 + 8)
            done()
          })
        })
      })

      describe('ipfs.object.data', () => {
        it('returns error for request without argument', (done) => {
          ctl.object.data(null, (err, result) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns error for request with invalid argument', (done) => {
          ctl.object.data('invalid', {enc: 'base58'}, (err, result) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns value', (done) => {
          ctl.object.data('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm', {enc: 'base58'}, (err, result) => {
            expect(err).to.not.exist
            expect(result.toString()).to.equal('another')
            done()
          })
        })
      })

      describe('ipfs.object.links', () => {
        it('returns error for request without argument', (done) => {
          ctl.object.links(null, (err, result) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns error for request with invalid argument', (done) => {
          ctl.object.links('invalid', {enc: 'base58'}, (err, result) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns value', (done) => {
          const expectedResult = {
            Name: 'some link',
            Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
            Size: 8
          }

          ctl.object.links('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm', {enc: 'base58'}, (err, result) => {
            expect(err).to.not.exist
            expect(result[0].toJSON()).to.deep.equal(expectedResult)
            done()
          })
        })
      })

      // TODO revisit these
      describe.skip('ipfs.object.patch.appendData', () => {
        it('returns error for request without key & data', (done) => {
          ctl.object.patch.appendData(null, null, (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns error for request without key', (done) => {
          const key = 'QmVLUHkjGg3duGb5w3dnwK5w2P9QWuJmtVNuDPLc9ZDjzk'

          ctl.object.patch.appendData(key, null, {enc: 'base58'}, (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns error for request without data', (done) => {
          const filePath = 'test/test-data/badnode.json'

          ctl.object.patch.appendData(null, filePath, (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('updates value', (done) => {
          const key = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
          const filePath = 'test/test-data/badnode.json'
          const expectedResult = {
            Data: fs.readFileSync(filePath).toString(),
            Hash: 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6',
            Links: [],
            Size: 19
          }

          ctl.object.patch.appendData(key, filePath, {enc: 'base58'}, (err, res) => {
            expect(err).not.to.exist
            expect(res.toJSON()).to.deep.equal(expectedResult)
            done()
          })
        })
      })

      // TODO revisit these
      describe.skip('ipfs.object.patch.setData', () => {
        it('returns error for request without key & data', (done) => {
          ctl.object.patch.setData(null, null, (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns error for request without key', (done) => {
          const key = 'QmVLUHkjGg3duGb5w3dnwK5w2P9QWuJmtVNuDPLc9ZDjzk'

          ctl.object.patch.setData(key, null, {enc: 'base58'}, (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns error for request without data', (done) => {
          const filePath = 'test/test-data/badnode.json'

          ctl.object.patch.setData(null, filePath, (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('updates value', (done) => {
          const key = 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6'
          const filePath = 'test/test-data/badnode.json'
          const expectedResult = {
            Data: fs.readFileSync(filePath).toString(),
            Hash: 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6',
            Links: [],
            Size: 19
          }

          ctl.object.patch.setData(key, filePath, {enc: 'base58'}, (err, res) => {
            expect(err).not.to.exist
            expect(res.toJSON()).to.deep.equal(expectedResult)
            done()
          })
        })
      })

      describe('ipfs.object.patch.addLink', () => {
        it('returns error for request without arguments', (done) => {
          ctl.object.patch.addLink(null, null, null, (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns error for request only one invalid argument', (done) => {
          ctl.object.patch.addLink('invalid', null, null, (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns error for request without name', (done) => {
          const root = 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
          const name = ''
          const ref = 'QmTz3oc4gdpRMKP2sdGUPZTAGRngqjsi99BPoztyP53JMM'
          const link = new DAGLink(name, 2, ref)
          ctl.object.patch.addLink(root, link, {enc: 'base58'}, (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('updates value', (done) => {
          const root = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
          const name = 'foo'
          const ref = 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
          const link = new DAGLink(name, 10, ref)
          ctl.object.patch.addLink(root, link, {enc: 'base58'}, (err, result) => {
            expect(err).not.to.exist
            const res = result.toJSON()
            expect(res.Hash).to.equal('QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK')
            expect(res.Links[0]).to.deep.equal({
              Name: 'foo',
              Hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
              Size: 4
            })
            done()
          })
        })
      })

      describe('ipfs.object.patch.rmLink', () => {
        it('returns error for request without arguments', (done) => {
          ctl.object.patch.rmLink(null, null, (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns error for request only one invalid argument', (done) => {
          ctl.object.patch.rmLink('invalid', null, (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('returns error for request with invalid first argument', (done) => {
          const root = ''
          const link = 'foo'

          ctl.object.patch.rmLink(root, link, (err) => {
            expect(err).to.exist
            done()
          })
        })

        it('updates value', (done) => {
          const root = 'QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK'
          const link = new DAGLink('foo')

          ctl.object.patch.rmLink(root, link, {enc: 'base58'}, (err, res) => {
            expect(err).not.to.exist
            expect(res.toJSON().Hash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
            done()
          })
        })
      })
    })
  })
}
