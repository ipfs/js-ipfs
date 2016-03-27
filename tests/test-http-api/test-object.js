/* eslint-env mocha */

const expect = require('chai').expect
const APIctl = require('ipfs-api')
const fs = require('fs')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')

describe('object', () => {
  describe('api', () => {
    var api

    it('api', (done) => {
      api = require('../../src/http-api').server.select('API')
      done()
    })

    describe('/object/new', () => {
      it('returns 500 for request with invalid argument', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/object/new?arg'
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
          url: '/api/v0/object/new'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Hash)
            .to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
          expect(res.result.Links)
            .to.equal(null)
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
          expect(res.result.Links)
             .to.deep.equal([])
          expect(res.result.Data)
             .to.equal('')
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
        const filePath = 'tests/badnode.json'
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
        const filePath = 'tests/node.json'
        form.append('data', fs.createReadStream(filePath))
        const headers = form.getHeaders()
        const expectedResult = {
          Hash: 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm',
          Links: [{
            Name: 'some link',
            Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
            Size: 8
          }]
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
          expect(res.result.LinksSize).to.equal(8)
          expect(res.result.DataSize).to.equal(7)
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
        const filePath = 'tests/badconfig'
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
        const filePath = 'tests/badconfig'
        form.append('data', fs.createReadStream(filePath))
        const headers = form.getHeaders()
        const expectedResult = {
          Hash: 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6',
          Links: []
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
        const filePath = 'tests/badconfig'
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
        const filePath = 'tests/badconfig'
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
      ctl.object.new(null, (err, result) => {
        expect(err).to.not.exist
        expect(result.Hash)
          .to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
        expect(result.Links)
          .to.equal(null)
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
        ctl.object.get('invalid', (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns value', (done) => {
        ctl.object.get('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n', (err, result) => {
          expect(err).to.not.exist
          expect(result.Links)
             .to.deep.equal([])
          expect(result.Data)
             .to.equal('')
          done()
        })
      })
    })

    describe('ipfs.object.put', () => {
      it('returns error if the node is invalid', (done) => {
        const filePath = 'tests/badnode.json'

        ctl.object.put(filePath, 'json', (err) => {
          expect(err).to.exist
          done()
        })
      })

      it('updates value', (done) => {
        const filePath = 'tests/node.json'
        const expectedResult = {
          Hash: 'QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm',
          Links: [{
            Name: 'some link',
            Hash: 'QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V',
            Size: 8
          }]
        }

        ctl.object.put(filePath, 'json', (err, res) => {
          expect(err).not.to.exist
          expect(res).to.deep.equal(expectedResult)
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
        ctl.object.stat('invalid', (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns value', (done) => {
        ctl.object.stat('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm', (err, result) => {
          expect(err).to.not.exist
          expect(result.Hash).to.equal('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm')
          expect(result.NumLinks).to.equal(1)
          expect(result.BlockSize).to.equal(60)
          expect(result.LinksSize).to.equal(8)
          expect(result.DataSize).to.equal(7)
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
        ctl.object.data('invalid', (err, result) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns value', (done) => {
        ctl.object.data('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm', (err, result) => {
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
        ctl.object.links('invalid', (err, result) => {
          expect(err).to.exist
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

        ctl.object.links('QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm', (err, result) => {
          expect(err).to.not.exist
          expect(result).to.deep.equal(expectedResult)
          done()
        })
      })
    })

    describe('ipfs.object.patch.appendData', () => {
      it('returns error for request without key & data', (done) => {
        ctl.object.patch.appendData(null, null, (err) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns error for request without key', (done) => {
        const key = 'QmVLUHkjGg3duGb5w3dnwK5w2P9QWuJmtVNuDPLc9ZDjzk'

        ctl.object.patch.appendData(key, null, (err) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns error for request without data', (done) => {
        const filePath = 'tests/badnode.json'

        ctl.object.patch.appendData(null, filePath, (err) => {
          expect(err).to.exist
          done()
        })
      })

      it('updates value', (done) => {
        const key = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
        const filePath = 'tests/badnode.json'
        const expectedResult = {
          Hash: 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6',
          Links: []
        }

        ctl.object.patch.appendData(key, filePath, (err, res) => {
          expect(err).not.to.exist
          expect(res).to.deep.equal(expectedResult)
          done()
        })
      })
    })

    describe('ipfs.object.patch.setData', () => {
      it('returns error for request without key & data', (done) => {
        ctl.object.patch.setData(null, null, (err) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns error for request without key', (done) => {
        const key = 'QmVLUHkjGg3duGb5w3dnwK5w2P9QWuJmtVNuDPLc9ZDjzk'

        ctl.object.patch.setData(key, null, (err) => {
          expect(err).to.exist
          done()
        })
      })

      it('returns error for request without data', (done) => {
        const filePath = 'tests/badnode.json'

        ctl.object.patch.setData(null, filePath, (err) => {
          expect(err).to.exist
          done()
        })
      })

      it('updates value', (done) => {
        const key = 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6'
        const filePath = 'tests/badnode.json'
        const expectedResult = {
          Hash: 'QmfY37rjbPCZRnhvvJuQ46htW3VCAWziVB991P79h6WSv6',
          Links: []
        }

        ctl.object.patch.setData(key, filePath, (err, res) => {
          expect(err).not.to.exist
          expect(res).to.deep.equal(expectedResult)
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

        ctl.object.patch.addLink(root, name, ref, (err) => {
          expect(err).to.exist
          done()
        })
      })

      it('updates value', (done) => {
        const root = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
        const name = 'foo'
        const ref = 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'

        ctl.object.patch.addLink(root, name, ref, (err, res) => {
          expect(err).not.to.exist
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
        const link = 'foo'

        ctl.object.patch.rmLink(root, link, (err, res) => {
          expect(err).not.to.exist
          expect(res.Hash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
          done()
        })
      })
    })
  })
})
