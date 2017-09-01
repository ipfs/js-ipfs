/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const API = require('../../src/http')
const ncp = require('ncp').ncp
const path = require('path')
const clean = require('../utils/clean')

describe('HTTP GATEWAY', () => {
  const repoExample = path.join(__dirname, '../go-ipfs-repo')
  const repoTests = path.join(__dirname, '../repo-tests-run')

  let http = {}
  let gateway

  before((done) => {
    http.api = new API(repoTests)

    ncp(repoExample, repoTests, (err) => {
      expect(err).to.not.exist()

      http.api.start(false, () => {
        gateway = http.api.server.select('Gateway')
        done()
      })
    })
  })

  after((done) => {
    http.api.stop((err) => {
      expect(err).to.not.exist()
      clean(repoTests)
      done()
    })
  })

  describe('/ipfs/* route', () => {
    it('returns 400 for request without argument', (done) => {
      gateway.inject({
        method: 'GET',
        url: '/ipfs'
      }, (res) => {
        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
        done()
      })
    })

    it('400 for request with invalid argument', (done) => {
      gateway.inject({
        method: 'GET',
        url: '/ipfs/invalid'
      }, (res) => {
        expect(res.statusCode).to.equal(400)
        expect(res.result.Message).to.be.a('string')
        done()
      })
    })

    it('valid hash', (done) => {
      gateway.inject({
        method: 'GET',
        url: '/ipfs/QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o'
      }, (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.rawPayload).to.deep.equal(new Buffer('hello world' + '\n'))
        expect(res.payload).to.equal('hello world' + '\n')
        done()
      })
    })
  })
})
