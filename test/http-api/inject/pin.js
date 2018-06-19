/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const expect = require('chai').expect

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
// - root2

const pins = {
  root1: 'QmVtU7ths96fMgZ8YSZAbKghyieq7AjxNdcqyVzxTt3qVe',
  c1: 'QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V',
  c2: 'QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y',
  c3: 'QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7',
  c4: 'QmUzLxaXnM8RYCPEqLDX5foToi5aNZHqfYr285w2BKhkft',
  c5: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
  c6: 'QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ',
  root2: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
}

module.exports = (http) => {
  describe('pin', () => {
    let api

    before(() => {
      api = http.api.server.select('API')
    })

    describe('rm', () => {
      it('fails on invalid args', done => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pin/rm?arg=invalid`
        }, res => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Message).to.match(/invalid ipfs ref path/)
          done()
        })
      })

      it('unpins recursive pins', done => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pin/rm?arg=${pins.root1}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Pins).to.deep.eql([pins.root1])
          done()
        })
      })

      it('unpins direct pins', done => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pin/add?arg=${pins.root1}&recursive=false`
        }, res => {
          expect(res.statusCode).to.equal(200)
          api.inject({
            method: 'POST',
            url: `/api/v0/pin/rm?arg=${pins.root1}&recursive=false`
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result.Pins).to.deep.eql([pins.root1])
            done()
          })
        })
      })
    })

    describe('add', () => {
      it('fails on invalid args', done => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pin/add?arg=invalid`
        }, res => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Message).to.match(/invalid ipfs ref path/)
          done()
        })
      })

      it('recursively', done => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pin/add?arg=${pins.root1}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Pins).to.deep.eql([pins.root1])
          done()
        })
      })

      it('directly', done => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pin/add?arg=${pins.root1}&recursive=false`
        }, (res) => {
          // by directly pinning a node that is already recursively pinned,
          // it should error and verifies that the endpoint is parsing
          // the recursive arg correctly.
          expect(res.statusCode).to.equal(500)
          expect(res.result.Message).to.match(/already pinned recursively/)
          done()
        })
      })
    })

    describe('ls', () => {
      it('fails on invalid args', done => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pin/ls?arg=invalid`
        }, res => {
          expect(res.statusCode).to.equal(500)
          expect(res.result.Message).to.match(/invalid ipfs ref path/)
          done()
        })
      })

      it('finds all pinned objects', done => {
        api.inject({
          method: 'GET',
          url: '/api/v0/pin/ls'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Keys).to.have.all.keys(Object.values(pins))
          done()
        })
      })

      it('finds specific pinned objects', done => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pin/ls?arg=${pins.c1}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Keys[pins.c1].Type)
            .to.equal(`indirect through ${pins.root1}`)
          done()
        })
      })

      it('finds pins of type', done => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pin/ls?type=recursive`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Keys).to.deep.eql({
            QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn: {
              Type: 'recursive'
            },
            QmVtU7ths96fMgZ8YSZAbKghyieq7AjxNdcqyVzxTt3qVe: {
              Type: 'recursive'
            }
          })
          done()
        })
      })
    })
  })
}
