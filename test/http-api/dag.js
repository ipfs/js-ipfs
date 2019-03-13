/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const path = require('path')
const expect = chai.expect
chai.use(dirtyChai)
const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({
  exec: path.resolve(__dirname, '..', '..', 'src', 'cli', 'bin.js')
})

describe('dag endpoint', () => {
  let ipfs = null
  let ipfsd = null

  before(function (done) {
    this.timeout(20 * 1000)

    df.spawn({
      initOptions: {
        bits: 1024
      },
      config: {
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          },
          webRTCStar: {
            Enabled: false
          }
        }
      }
    }, (err, _ipfsd) => {
      if (err) {
        console.error(err)
      }

      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  it('returns error for request without argument', (done) => {
    ipfs.dag.get(null, (err, result) => {
      expect(err.message).to.include("invalid 'ipfs ref' path")
      done()
    })
  })

  it('returns error for request with invalid argument', (done) => {
    ipfs.dag.get('invalid', { enc: 'base58' }, (err, result) => {
      expect(err.message).to.include("invalid 'ipfs ref' path")
      done()
    })
  })

  it('returns value', (done) => {
    ipfs.dag.get('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n', (err, result) => {
      expect(err).to.not.exist()
      expect(result.value).to.be.ok()
      expect(result.value.links).to.be.empty()
      expect(result.value.data).to.be.empty()

      done()
    })
  })

  it('returns value with a path as part of the cid', (done) => {
    ipfs.dag.put({
      foo: 'bar'
    }, {
      format: 'dag-cbor',
      hash: 'sha2-256'
    }, (err, cid) => {
      expect(err).to.not.exist()

      ipfs.dag.get(`${cid.toBaseEncodedString()}/foo`, (err, result) => {
        expect(err).to.not.exist()
        expect(result.value).to.equal('bar')

        done()
      })
    })
  })

  it('returns value with a path as a separate argument', (done) => {
    ipfs.dag.put({
      foo: 'bar'
    }, {
      format: 'dag-cbor',
      hash: 'sha2-256'
    }, (err, cid) => {
      expect(err).to.not.exist()

      ipfs.dag.get(cid, 'foo', (err, result) => {
        expect(err).to.not.exist()
        expect(result.value).to.equal('bar')

        done()
      })
    })
  })
})
