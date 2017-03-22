/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const series = require('async/series')
const FactoryClient = require('./ipfs-factory/client')

describe.skip('.ping', () => {
  let ipfs
  let other
  let fc

  before(function (done) {
    this.timeout(20 * 1000) // slow CI
    fc = new FactoryClient()
    series([
      (cb) => {
        fc.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          cb()
        })
      },
      (cb) => {
        console.log('going to spawn second node')
        fc.spawnNode((err, node) => {
          expect(err).to.not.exist()
          other = node
          cb()
        })
      },
      (cb) => {
        ipfs.id((err, id) => {
          expect(err).to.not.exist()
          const ma = id.addresses[0]
          other.swarm.connect(ma, cb)
        })
      }
    ], done)
  })

  after((done) => fc.dismantle(done))

  describe('callback API', () => {
    it('ping another peer', (done) => {
      other.id((err, id) => {
        expect(err).to.not.exist()

        ipfs.ping(id.id, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.have.a.property('Success')
          expect(res).to.have.a.property('Time')
          expect(res).to.have.a.property('Text')
          expect(res.Text).to.contain('Average latency')
          expect(res.Time).to.be.a('number')
          done()
        })
      })
    })
  })

  describe('promise API', () => {
    it('ping another peer', () => {
      return other.id()
        .then((id) => {
          return ipfs.ping(id.id)
        })
        .then((res) => {
          expect(res).to.have.a.property('Success')
          expect(res).to.have.a.property('Time')
          expect(res).to.have.a.property('Text')
          expect(res.Text).to.contain('Average latency')
          expect(res.Time).to.be.a('number')
        })
    })
  })
})
