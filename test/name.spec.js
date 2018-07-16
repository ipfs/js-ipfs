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
  let testFileCid

  before(function (done) {
    this.timeout(30 * 1000)

    series([
      (cb) => {
        f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
          expect(err).to.not.exist()
          ipfsd = _ipfsd
          ipfs = IPFSApi(_ipfsd.apiAddr)
          cb()
        })
      },
      (cb) => {
        f.spawn({ initOptions: { bits: 1024 } }, (err, node) => {
          expect(err).to.not.exist()
          other = node.api
          otherd = node
          cb()
        })
      },
      (cb) => {
        parallel([
          (cb) => {
            ipfs.id((err, id) => {
              expect(err).to.not.exist()
              const ma = id.addresses[0]
              other.swarm.connect(ma, cb)
            })
          },
          (cb) => {
            ipfs.files.add(testfile, (err, res) => {
              expect(err).to.not.exist()
              testFileCid = res[0].hash
              cb()
            })
          }
        ], cb)
      }
    ], done)
  })

  after(function (done) {
    this.timeout(10 * 1000)

    parallel([
      (cb) => {
        if (!ipfsd) return cb()
        ipfsd.stop(cb)
      },
      (cb) => {
        if (!otherd) return cb()
        otherd.stop(cb)
      }
    ], done)
  })

  it('.name.publish', function (done) {
    this.timeout(5 * 60 * 1000)

    ipfs.name.publish(testFileCid, (err, res) => {
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
