/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const parallel = require('async/parallel')
const series = require('async/series')
const loadFixture = require('aegir/fixtures')

const IPFSApi = require('../src')
const f = require('./utils/factory')

const testfile = loadFixture('test/fixtures/testfile.txt')

describe('.name', () => {
  let ipfs
  let ipfsd
  let other
  let otherd
  let name

  before(function (done) {
    this.timeout(20 * 1000)

    series([
      (cb) => {
        f.spawn((err, _ipfsd) => {
          expect(err).to.not.exist()
          ipfsd = _ipfsd
          ipfs = IPFSApi(_ipfsd.apiAddr)
          cb()
        })
      },
      (cb) => {
        f.spawn((err, node) => {
          expect(err).to.not.exist()
          other = node.api
          otherd = node
          cb()
        })
      },
      (cb) => {
        ipfsd.api.id((err, id) => {
          expect(err).to.not.exist()
          const ma = id.addresses[0]
          other.swarm.connect(ma, cb)
        })
      }
    ], done)
  })

  after((done) => {
    parallel([
      (cb) => ipfsd.stop(cb),
      (cb) => otherd.stop(cb)
    ], done)
  })

  it('add file for testing', (done) => {
    const expectedMultihash = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'

    ipfs.files.add(testfile, (err, res) => {
      expect(err).to.not.exist()

      expect(res).to.have.length(1)
      expect(res[0].hash).to.equal(expectedMultihash)
      expect(res[0].path).to.equal(expectedMultihash)
      done()
    })
  })

  it('.name.publish', function (done) {
    this.timeout(100 * 1000)

    ipfs.name.publish('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
      expect(err).to.not.exist()
      name = res
      expect(name).to.exist()
      done()
    })
  })

  it('.name.resolve', (done) => {
    ipfs.name.resolve(name.name, (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.exist()
      expect(res).to.be.eql(name.value)
      done()
    })
  })
})
