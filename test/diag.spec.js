/* eslint-env mocha */
'use strict'

const FactoryClient = require('./ipfs-factory/client')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

describe('.diag', function () {
  this.timeout(50 * 1000)

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

  after((done) => fc.dismantle(done))

  describe('Callback API', () => {
    // Disabled in go-ipfs 0.4.10
    it.skip('.diag.net', (done) => {
      ipfs.diag.net((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        done()
      })
    })

    it('.diag.sys', (done) => {
      ipfs.diag.sys((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.have.a.property('memory')
        expect(res).to.have.a.property('diskinfo')
        done()
      })
    })

    it('.diag.cmds', (done) => {
      ipfs.diag.cmds((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        done()
      })
    })
  })

  describe('Promise API', () => {
    // Disabled in go-ipfs 0.4.10
    it.skip('.diag.net', () => {
      return ipfs.diag.net()
        .then((res) => expect(res).to.exist())
    })

    it('.diag.sys', () => {
      return ipfs.diag.sys()
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.have.a.property('memory')
          expect(res).to.have.a.property('diskinfo')
        })
    })

    it('.diag.cmds', () => {
      return ipfs.diag.cmds()
        .then((res) => expect(res).to.exist())
    })
  })
})
