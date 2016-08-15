/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const FactoryClient = require('../factory/factory-client')

describe('.refs', () => {
  let ipfs
  let fc

  before(function (done) {
    this.timeout(20 * 1000) // slow CI
    fc = new FactoryClient()
    fc.spawnNode((err, node) => {
      expect(err).to.not.exist
      ipfs = node
      done()
    })
  })

  after((done) => {
    fc.dismantle(done)
  })

  const folder = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
  const result = [{
    Ref: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V about',
    Err: ''
  }, {
    Ref: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG QmYCvbfNbCwFR45HiNP45rwJgvatpiW38D961L5qAhUM5Y contact',
    Err: ''
  }, {
    Ref: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7 help',
    Err: ''
  }, {
    Ref: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG QmdncfsVm2h5Kqq9hPmU7oAVX2zTSVP3L869tgTbPYnsha quick-start',
    Err: ''
  }, {
    Ref: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB readme',
    Err: ''
  }, {
    Ref: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG QmTumTjvcYCAvRRwQ8sDRxh8ezmrcr88YFU7iYNroGGTBZ security-notes',
    Err: ''
  }]

  it('refs', (done) => {
    if (!isNode) {
      return done()
    }

    ipfs.refs(folder, {format: '<src> <dst> <linkname>'}, (err, objs) => {
      expect(err).to.not.exist
      expect(objs).to.eql(result)

      done()
    })
  })

  describe('promise', () => {
    it('refs', () => {
      if (!isNode) {
        return
      }

      return ipfs.refs(folder, {format: '<src> <dst> <linkname>'})
        .then((objs) => {
          expect(objs).to.eql(result)
        })
    })
  })
})
