/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const fs = require('fs')
const FormData = require('form-data')
const streamToPromise = require('stream-to-promise')
const each = require('async/each')

// use a tree of ipfs objects for recursive tests:
//  root
//   |`leaf
//    `branch
//      `subLeaf

const keys = {
  root: 'QmWQwS2Xh1SFGMPzUVYQ52b7RC7fTfiaPHm3ZyTRZuHmer',
  leaf: 'QmaZoTQ6wFe7EtvaePBUeXavfeRqCAq3RUMomFxBpZLrLA',
  branch: 'QmNxjjP7dtx6pzxWGBRCrgmjX3JqKL7uF2Kjx7ExiZDbSB',
  subLeaf: 'QmUzzznkyQL7FjjBztG3D1tTjBuxeArLceDZnuSowUggXL'
}

module.exports = (http) => {
  describe('pin', () => {
    let api

    before((done) => {
      // add test tree to repo
      api = http.api.server.select('API')
      const putFile = (filename, cb) => {
        const filePath = `test/test-data/tree/${filename}.json`
        const form = new FormData()
        form.append('file', fs.createReadStream(filePath))
        const headers = form.getHeaders()
        streamToPromise(form).then((payload) => {
          api.inject({
            method: 'POST',
            url: '/api/v0/object/put',
            headers: headers,
            payload: payload
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            cb()
          })
        })
      }
      each(Object.keys(keys), putFile, (err) => {
        expect(err).to.not.exist()
        done()
      })
    })

    describe('/pin/add', () => {
      it('pins object recursively by default', (done) => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pin/add?arg=${keys.root}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result).to.deep.equal({Pins: [keys.root]})
          done()
        })
      })
    })

    describe('/pin/add (direct)', () => {
      it('pins object directly if specified', (done) => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pin/add?arg=${keys.leaf}&recursive=false`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result).to.deep.equal({Pins: [keys.leaf]})
          done()
        })
      })
    })

    describe('/pin/ls (with path)', () => {
      it('finds specified pinned object', (done) => {
        api.inject({
          method: 'GET',
          url: `/api/v0/pin/ls?arg=/ipfs/${keys.root}/branch/subLeaf`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Keys[keys.subLeaf].Type)
            .to.equal(`indirect through ${keys.root}`)
          done()
        })
      })
    })

    describe('/pin/ls (without path or type)', () => {
      it('finds all pinned objects', (done) => {
        api.inject({
          method: 'GET',
          url: '/api/v0/pin/ls'
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result.Keys[keys.root].Type).to.equal('recursive')
          expect(res.result.Keys[keys.leaf].Type).to.equal('direct')
          expect(res.result.Keys[keys.branch].Type).to.equal('indirect')
          expect(res.result.Keys[keys.subLeaf].Type).to.equal('indirect')
          done()
        })
      })
    })

    describe('/pin/rm (direct)', () => {
      it('unpins only directly pinned objects if specified', (done) => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pin/rm?arg=${keys.leaf}&recursive=false`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result).to.deep.equal({Pins: [keys.leaf]})

          api.inject({
            method: 'POST',
            url: `/api/v0/pin/rm?arg=${keys.root}&recursive=false`
          }, (res) => {
            expect(res.statusCode).to.equal(500)
            expect(res.result.Message).to.equal(
              'Failed to remove pin: ' +
              'QmWQwS2Xh1SFGMPzUVYQ52b7RC7fTfiaPHm3ZyTRZuHmer ' +
              'is pinned recursively'
            )
            done()
          })
        })
      })
    })

    describe('/pin/rm', () => {
      it('unpins recursively by default', (done) => {
        api.inject({
          method: 'POST',
          url: `/api/v0/pin/rm?arg=${keys.root}`
        }, (res) => {
          expect(res.statusCode).to.equal(200)
          expect(res.result).to.deep.equal({Pins: [keys.root]})
          done()
        })
      })
    })
  })
}
