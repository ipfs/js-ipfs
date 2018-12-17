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
const waterfall = require('async/waterfall')

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

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should create a new object and return a base64 encoded CID', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/new?cid-base=base64'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
          done()
        })
      })

      it('should not create a new object for invalid cid-base option', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/new?cid-base=invalid'
        }, (res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.result.Message).to.include('child "cid-base" fails')
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
          expect(res.result.Links).to.eql([])
          expect(res.result.Data).to.be.empty()
          done()
        })
      })

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should get object and return a base64 encoded CID', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        }, (res) => {
          expect(res.statusCode).to.equal(200)

          api.inject({
            method: 'POST',
            url: '/api/v0/object/get?cid-base=base64&arg=' + res.result.Hash
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
            done()
          })
        })
      })

      it('should not get an object for invalid cid-base option', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        }, (res) => {
          expect(res.statusCode).to.equal(200)

          api.inject({
            method: 'POST',
            url: '/api/v0/object/get?cid-base=invalid&arg=' + res.result.Hash
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result.Message).to.include('child "cid-base" fails')
            done()
          })
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
        const filePath = 'test/fixtures/test-data/badnode.json'
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

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should put data and return a base64 encoded CID', (done) => {
        const form = new FormData()
        form.append('file', JSON.stringify({ Data: 'TEST' + Date.now(), Links: [] }), { filename: 'node.json' })
        const headers = form.getHeaders()

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/object/put?cid-base=base64',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
            done()
          })
        })
      })

      it('should not put data for invalid cid-base option', (done) => {
        const form = new FormData()
        form.append('file', JSON.stringify({ Data: 'TEST' + Date.now(), Links: [] }), { filename: 'node.json' })
        const headers = form.getHeaders()

        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/object/put?cid-base=invalid',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result.Message).to.include('child "cid-base" fails')
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

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should stat object and return a base64 encoded CID', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        }, (res) => {
          expect(res.statusCode).to.equal(200)

          api.inject({
            method: 'POST',
            url: '/api/v0/object/stat?cid-base=base64&arg=' + res.result.Hash
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
            done()
          })
        })
      })

      it('should not stat object for invalid cid-base option', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        }, (res) => {
          expect(res.statusCode).to.equal(200)

          api.inject({
            method: 'POST',
            url: '/api/v0/object/stat?cid-base=invalid&arg=' + res.result.Hash
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result.Message).to.include('child "cid-base" fails')
            done()
          })
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

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should list object links and return a base64 encoded CID', (done) => {
        waterfall([
          (cb) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/new'
            }, (res) => {
              expect(res.statusCode).to.equal(200)
              cb(null, res.result.Hash)
            })
          },
          (linkHash, cb) => {
            const form = new FormData()
            form.append('file', JSON.stringify({
              Data: 'TEST' + Date.now(),
              Links: [{ Name: 'emptyNode', Hash: linkHash, Size: 8 }]
            }), { filename: 'node.json' })
            const headers = form.getHeaders()

            streamToPromise(form).then((payload) => {
              api.inject({
                method: 'POST',
                url: '/api/v0/object/put',
                headers: headers,
                payload: payload
              }, (res) => {
                expect(res.statusCode).to.equal(200)
                cb(null, res.result.Hash)
              })
            })
          }
        ], (err, hash) => {
          expect(err).to.not.exist()

          api.inject({
            method: 'POST',
            url: '/api/v0/object/links?cid-base=base64&arg=' + hash
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
            expect(res.result.Links).to.have.length(1)
            expect(multibase.isEncoded(res.result.Links[0].Hash)).to.deep.equal('base64')
            done()
          })
        })
      })

      it('should not list object links for invalid cid-base option', (done) => {
        waterfall([
          (cb) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/new'
            }, (res) => {
              expect(res.statusCode).to.equal(200)
              cb(null, res.result.Hash)
            })
          },
          (linkHash, cb) => {
            const form = new FormData()
            form.append('file', JSON.stringify({
              Data: 'TEST' + Date.now(),
              Links: [{ Name: 'emptyNode', Hash: linkHash, Size: 8 }]
            }), { filename: 'node.json' })
            const headers = form.getHeaders()

            streamToPromise(form).then((payload) => {
              api.inject({
                method: 'POST',
                url: '/api/v0/object/put',
                headers: headers,
                payload: payload
              }, (res) => {
                expect(res.statusCode).to.equal(200)
                cb(null, res.result.Hash)
              })
            })
          }
        ], (err, hash) => {
          expect(err).to.not.exist()

          api.inject({
            method: 'POST',
            url: '/api/v0/object/links?cid-base=invalid&arg=' + hash
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result.Message).to.include('child "cid-base" fails')
            done()
          })
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
        const filePath = 'test/fixtures/test-data/badconfig'
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
        const filePath = 'test/fixtures/test-data/badconfig'
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

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should append data to object and return a base64 encoded CID', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        }, (res) => {
          expect(res.statusCode).to.equal(200)

          const form = new FormData()
          form.append('data', Buffer.from('TEST' + Date.now()))
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/patch/append-data?cid-base=base64&arg=' + res.result.Hash,
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(200)
              expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
              done()
            })
          })
        })
      })

      it('should not append data to object for invalid cid-base option', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        }, (res) => {
          expect(res.statusCode).to.equal(200)

          const form = new FormData()
          form.append('data', Buffer.from('TEST' + Date.now()))
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/patch/append-data?cid-base=invalid&arg=' + res.result.Hash,
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(400)
              expect(res.result.Message).to.include('child "cid-base" fails')
              done()
            })
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
        const filePath = 'test/fixtures/test-data/badconfig'
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
        const filePath = 'test/fixtures/test-data/badconfig'
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

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should set data for object and return a base64 encoded CID', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        }, (res) => {
          expect(res.statusCode).to.equal(200)

          const form = new FormData()
          form.append('data', Buffer.from('TEST' + Date.now()))
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/patch/set-data?cid-base=base64&arg=' + res.result.Hash,
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(200)
              expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
              done()
            })
          })
        })
      })

      it('should not set data for object for invalid cid-base option', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        }, (res) => {
          expect(res.statusCode).to.equal(200)

          const form = new FormData()
          form.append('data', Buffer.from('TEST' + Date.now()))
          const headers = form.getHeaders()

          streamToPromise(form).then((payload) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/patch/set-data?cid-base=invalid&arg=' + res.result.Hash,
              headers: headers,
              payload: payload
            }, (res) => {
              expect(res.statusCode).to.equal(400)
              expect(res.result.Message).to.include('child "cid-base" fails')
              done()
            })
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

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should add a link to an object and return a base64 encoded CID', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        }, (res) => {
          expect(res.statusCode).to.equal(200)

          api.inject({
            method: 'POST',
            url: `/api/v0/object/patch/add-link?cid-base=base64&arg=${res.result.Hash}&arg=test&arg=${res.result.Hash}`
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
            done()
          })
        })
      })

      it('should not add a link to an object for invalid cid-base option', (done) => {
        api.inject({
          method: 'POST',
          url: '/api/v0/object/new'
        }, (res) => {
          expect(res.statusCode).to.equal(200)

          api.inject({
            method: 'POST',
            url: `/api/v0/object/patch/add-link?cid-base=invalid&arg=${res.result.Hash}&arg=test&arg=${res.result.Hash}`
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result.Message).to.include('child "cid-base" fails')
            done()
          })
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

      // TODO: unskip after switch to v1 CIDs by default
      it.skip('should remove a link from an object and return a base64 encoded CID', (done) => {
        const linkName = 'TEST' + Date.now()

        waterfall([
          (cb) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/new'
            }, (res) => {
              expect(res.statusCode).to.equal(200)
              cb(null, res.result.Hash)
            })
          },
          (linkHash, cb) => {
            const form = new FormData()
            form.append('file', JSON.stringify({
              Data: 'TEST' + Date.now(),
              Links: [{ Name: linkName, Hash: linkHash, Size: 8 }]
            }), { filename: 'node.json' })
            const headers = form.getHeaders()

            streamToPromise(form).then((payload) => {
              api.inject({
                method: 'POST',
                url: '/api/v0/object/put',
                headers: headers,
                payload: payload
              }, (res) => {
                expect(res.statusCode).to.equal(200)
                cb(null, res.result.Hash, linkHash)
              })
            })
          }
        ], (err, hash) => {
          expect(err).to.not.exist()

          api.inject({
            method: 'POST',
            url: `/api/v0/object/patch/rm-link?cid-base=base64&arg=${hash}&arg=${linkName}`
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(multibase.isEncoded(res.result.Hash)).to.deep.equal('base64')
            done()
          })
        })
      })

      it('should not remove a link from an object for invalid cid-base option', (done) => {
        const linkName = 'TEST' + Date.now()

        waterfall([
          (cb) => {
            api.inject({
              method: 'POST',
              url: '/api/v0/object/new'
            }, (res) => {
              expect(res.statusCode).to.equal(200)
              cb(null, res.result.Hash)
            })
          },
          (linkHash, cb) => {
            const form = new FormData()
            form.append('file', JSON.stringify({
              Data: 'TEST' + Date.now(),
              Links: [{ Name: linkName, Hash: linkHash, Size: 8 }]
            }), { filename: 'node.json' })
            const headers = form.getHeaders()

            streamToPromise(form).then((payload) => {
              api.inject({
                method: 'POST',
                url: '/api/v0/object/put',
                headers: headers,
                payload: payload
              }, (res) => {
                expect(res.statusCode).to.equal(200)
                cb(null, res.result.Hash)
              })
            })
          }
        ], (err, hash) => {
          expect(err).to.not.exist()

          api.inject({
            method: 'POST',
            url: `/api/v0/object/patch/rm-link?cid-base=invalid&arg=${hash}&arg=${linkName}`
          }, (res) => {
            expect(res.statusCode).to.equal(400)
            expect(res.result.Message).to.include('child "cid-base" fails')
            done()
          })
        })
      })
    })
  })
}
