/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const fs = require('fs')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')

module.exports = (http) => {
  describe('/object', () => {
    let api

    before('api', () => {
      api = http.api.server.select('API')
    })

    describe('/new', () => {
      it('returns value', (done) => {
        api.inject({
          method: 'POST',
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

    describe('/get', () => {
      it('returns 400 for request without argument', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/get'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 500 for request with invalid argument', (done) => {
        api.inject({
          method: 'POST',
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
          method: 'POST',
          url: '/api/v0/object/get?arg=QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Links).to.be.eql([])
          expect(res.result.Data).to.be.empty
          done()
        })
      })
    })

    describe('/put', () => {
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
            expect(res.result).to.eql(expectedResult)
            done()
          })
        })
      })
    })

    describe('/stat', () => {
      it('returns 400 for request without argument', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/stat'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 500 for request with invalid argument', (done) => {
        api.inject({
          method: 'POST',
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
          method: 'POST',
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

    describe('/data', () => {
      it('returns 400 for request without argument', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/data'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 500 for request with invalid argument', (done) => {
        api.inject({
          method: 'POST',
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
          method: 'POST',
          url: '/api/v0/object/data?arg=QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result).to.equal('another')
          done()
        })
      })
    })

    describe('/links', () => {
      it('returns 400 for request without argument', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/links'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 500 for request with invalid argument', (done) => {
        api.inject({
          method: 'POST',
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
          method: 'POST',
          url: '/api/v0/object/links?arg=QmZZmY4KCu9r3e7M2Pcn46Fc5qbn6NpzaAGaYb22kbfTqm'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result).to.deep.equal(expectedResult)
          done()
        })
      })
    })

    describe('/patch/append-data', () => {
      it('returns 400 for request without key', (done) => {
        api.inject({
          method: 'POST',
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

    describe('/patch/set-data', () => {
      it('returns 400 for request without key', (done) => {
        api.inject({
          method: 'POST',
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

    describe('/patch/add-link', () => {
      it('returns 400 for request without arguments', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/add-link'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 400 for request with only one invalid argument', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/add-link?arg=invalid'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 500 for request with invalid first argument', (done) => {
        api.inject({
          method: 'POST',
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
          method: 'POST',
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
          method: 'POST',
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

    describe('/patch/rm-link', () => {
      it('returns 400 for request without arguments', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/rm-link'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 400 for request with only one invalid argument', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/patch/rm-link?arg=invalid'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result).to.be.a('string')
          done()
        })
      })

      it('returns 500 for request with invalid first argument', (done) => {
        api.inject({
          method: 'POST',
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
          method: 'POST',
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
          method: 'POST',
          url: '/api/v0/object/patch/rm-link?arg=QmdVHE8fUD6FLNLugtNxqDFyhaCgdob372hs6BYEe75VAK&arg=foo'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Hash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
          done()
        })
      })
    })
  })
}
