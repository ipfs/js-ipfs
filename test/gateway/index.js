/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const API = require('../../src/http')
const loadFixture = require('aegir/fixtures')
const bigFile = loadFixture(__dirname, '../../node_modules/interface-ipfs-core/test/fixtures/15mb.random', 'ipfs')

describe('HTTP Gateway', () => {
  let http = {}
  let gateway
  let bigFileHash = 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq'

  before((done) => {
    http.api = new API()

    http.api.start(true, () => {
      gateway = http.api.server.select('Gateway')
      http.api.node.files.add(bigFile, (err, files) => {
        if (err) throw err
        expect(files).to.exist()
        expect(files[0].hash).to.deep.equal(bigFileHash)

        done()
      })
    })
  })

  after((done) => {
    http.api.stop((err) => {
      expect(err).to.not.exist()
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
        expect(res.rawPayload).to.deep.equal(Buffer.from('hello world' + '\n'))
        expect(res.payload).to.equal('hello world' + '\n')
        done()
      })
    })

    it('stream a large file', (done) => {
      gateway.inject({
        method: 'GET',
        url: '/ipfs/' + bigFileHash
      }, (res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.rawPayload).to.deep.equal(bigFile)
        done()
      })
    })
  })
})
