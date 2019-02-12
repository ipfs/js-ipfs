/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const ipfsClient = require('../src')
const f = require('./utils/factory')

describe('.log', function () {
  this.timeout(100 * 1000)

  let ipfsd
  let ipfs

  before((done) => {
    f.spawn({ initOptions: { bits: 1024, profile: 'test' } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsClient(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => {
    if (!ipfsd) return done()
    ipfsd.stop(done)
  })

  it('.log.tail', (done) => {
    let i = setInterval(() => {
      ipfs.add(Buffer.from('just adding some data to generate logs'))
    }, 1000)

    const req = ipfs.log.tail((err, res) => {
      expect(err).to.not.exist()
      expect(req).to.exist()

      res.once('data', (obj) => {
        clearInterval(i)
        expect(obj).to.be.an('object')
        done()
      })
    })
  })

  it('.log.ls', (done) => {
    ipfs.log.ls((err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()

      expect(res).to.be.an('array')

      done()
    })
  })

  it('.log.level', (done) => {
    ipfs.log.level('all', 'error', (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()

      expect(res).to.be.an('object')
      expect(res).to.not.have.property('Error')
      expect(res).to.have.property('Message')

      done()
    })
  })
})
