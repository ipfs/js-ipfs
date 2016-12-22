/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const series = require('async/series')
const parallel = require('async/parallel')
const waterfall = require('async/waterfall')
const bl = require('bl')
const crypto = require('crypto')

const GoDaemon = require('./daemons/go')
const JsDaemon = require('./daemons/js')

describe('basic', () => {
  let goDaemon
  let jsDaemon

  before((done) => {
    goDaemon = new GoDaemon()
    jsDaemon = new JsDaemon()

    parallel([
      (cb) => goDaemon.start(cb),
      (cb) => jsDaemon.start(cb)
    ], done)
  })

  after((done) => {
    parallel([
      (cb) => goDaemon.stop(cb),
      (cb) => jsDaemon.stop(cb)
    ], done)
  })

  it('connect go <-> js', (done) => {
    let jsId
    let goId

    series([
      (cb) => parallel([
        (cb) => jsDaemon.api.id(cb),
        (cb) => goDaemon.api.id(cb)
      ], (err, ids) => {
        expect(err).to.not.exist
        jsId = ids[0]
        goId = ids[1]
        cb()
      }),
      (cb) => goDaemon.api.swarm.connect(jsId.addresses[0], cb),
      (cb) => jsDaemon.api.swarm.connect(goId.addresses[0], cb),
      (cb) => parallel([
        (cb) => goDaemon.api.swarm.peers(cb),
        (cb) => jsDaemon.api.swarm.peers(cb)
      ], (err, peers) => {
        expect(err).to.not.exist
        expect(peers[0].map((p) => p.peer.toB58String())).to.include(jsId.id)
        expect(peers[1].map((p) => p.peer.toB58String())).to.include(goId.id)
        cb()
      })
    ], done)
  })

  it('cat file: go -> js', (done) => {
    const data = crypto.randomBytes(1024 * 5)
    waterfall([
      (cb) => goDaemon.api.add(data, cb),
      (res, cb) => jsDaemon.api.cat(res[0].hash, cb),
      (stream, cb) => stream.pipe(bl(cb))
    ], (err, file) => {
      expect(err).to.not.exist
      expect(file).to.be.eql(data)
      done()
    })
  })

  it('cat file: js -> go', (done) => {
    const data = crypto.randomBytes(1024 * 5)
    waterfall([
      (cb) => jsDaemon.api.add(data, cb),
      (res, cb) => goDaemon.api.cat(res[0].hash, cb),
      (stream, cb) => stream.pipe(bl(cb))
    ], (err, file) => {
      expect(err).to.not.exist
      expect(file).to.be.eql(data)
      done()
    })
  })
})
