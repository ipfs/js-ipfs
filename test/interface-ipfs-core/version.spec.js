/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const FactoryClient = require('../factory/factory-client')

describe('.version', () => {
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

  // note, IPFS HTTP-API returns always the same object, the filtering
  // happens on the CLI
  it('checks the version', (done) => {
    ipfs.version((err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Version')
      expect(res).to.have.a.property('Commit')
      expect(res).to.have.a.property('Repo')
      done()
    })
  })

  it('with number option', (done) => {
    ipfs.version({number: true}, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Version')
      expect(res).to.have.a.property('Commit')
      expect(res).to.have.a.property('Repo')
      done()
    })
  })

  it('with commit option', (done) => {
    ipfs.version({commit: true}, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Version')
      expect(res).to.have.a.property('Commit')
      expect(res).to.have.a.property('Repo')
      done()
    })
  })

  it('with repo option', (done) => {
    ipfs.version({commit: true}, (err, res) => {
      expect(err).to.not.exist
      expect(res).to.have.a.property('Version')
      expect(res).to.have.a.property('Commit')
      expect(res).to.have.a.property('Repo')
      done()
    })
  })

  describe('promise', () => {
    it('checks the version', () => {
      return ipfs.version()
        .then((res) => {
          expect(res).to.have.a.property('Version')
          expect(res).to.have.a.property('Commit')
          expect(res).to.have.a.property('Repo')
        })
    })

    it('with number option', () => {
      return ipfs.version({number: true})
        .then((res) => {
          expect(res).to.have.a.property('Version')
          expect(res).to.have.a.property('Commit')
          expect(res).to.have.a.property('Repo')
        })
    })
  })
})
