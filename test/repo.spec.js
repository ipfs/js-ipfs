/* eslint-env mocha */
'use strict'

const FactoryClient = require('./ipfs-factory/client')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

describe('.repo', function () {
  this.timeout(50 * 1000) // slow CI

  let ipfs
  let fc

  before((done) => {
    fc = new FactoryClient()
    fc.spawnNode((err, node) => {
      expect(err).to.not.exist()
      ipfs = node
      done()
    })
  })

  after((done) => {
    fc.dismantle(done)
  })

  describe('Callback API', () => {
    it('.repo.gc', (done) => {
      ipfs.repo.gc((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        done()
      })
    })

    it('.repo.stat', (done) => {
      ipfs.repo.stat((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.have.a.property('NumObjects')
        expect(res).to.have.a.property('RepoSize')
        done()
      })
    })
  })

  describe('Promise API', () => {
    it('.repo.gc', () => {
      return ipfs.repo.gc().then((res) => expect(res).to.exist())
    })

    it('.repo.stat', () => {
      return ipfs.repo.stat()
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.have.a.property('NumObjects')
          expect(res).to.have.a.property('RepoSize')
        })
    })
  })
})
