/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const FactoryClient = require('../factory/factory-client')
describe('ls', function () {
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

  it('should correctly retrieve links', function (done) {
    if (!isNode) {
      return done()
    }

    ipfs.ls('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', (err, res) => {
      expect(err).to.not.exist

      expect(res).to.have.a.property('Objects')
      expect(res.Objects[0]).to.have.a.property('Links')
      expect(res.Objects[0]).to.have.property('Hash', 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
      done()
    })
  })

  it('should correctly handle a nonexisting hash', function (done) {
    ipfs.ls('surelynotavalidhashheh?', (err, res) => {
      expect(err).to.exist
      expect(res).to.not.exist
      done()
    })
  })

  it('should correctly handle a nonexisting path', function (done) {
    if (!isNode) return done()

    ipfs.ls('QmRNjDeKStKGTQXnJ2NFqeQ9oW/folder_that_isnt_there', (err, res) => {
      expect(err).to.exist
      expect(res).to.not.exist
      done()
    })
  })

  describe('promise', () => {
    it('should correctly retrieve links', () => {
      if (!isNode) return

      return ipfs.ls('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
        .then((res) => {
          expect(res).to.have.a.property('Objects')
          expect(res.Objects[0]).to.have.a.property('Links')
          expect(res.Objects[0]).to.have.property('Hash', 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')
        })
    })

    it('should correctly handle a nonexisting hash', () => {
      return ipfs.ls('surelynotavalidhashheh?')
        .catch((err) => {
          expect(err).to.exist
        })
    })

    it('should correctly handle a nonexisting path', () => {
      if (!isNode) return

      return ipfs.ls('QmRNjDeKStKGTQXnJ3NFqeQ9oW/folder_that_isnt_there')
        .catch((err) => {
          expect(err).to.exist
        })
    })
  })
})
