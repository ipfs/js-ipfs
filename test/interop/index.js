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

const sizes = [
  1024,
  1024 * 62,
  // starts failing with spdy
  1024 * 64,
  1024 * 512,
  1024 * 768,
  1024 * 1023,
  // starts failing with multiplex
  1024 * 1024,
  1024 * 1024 * 4,
  1024 * 1024 * 8
]

describe('basic', () => {
  let goDaemon
  let jsDaemon
  let js2Daemon

  before((done) => {
    goDaemon = new GoDaemon()
    jsDaemon = new JsDaemon()
    js2Daemon = new JsDaemon({port: 1})

    parallel([
      (cb) => goDaemon.start(cb),
      (cb) => jsDaemon.start(cb),
      (cb) => js2Daemon.start(cb)
    ], done)
  })

  after((done) => {
    series([
      (cb) => goDaemon.stop(cb),
      (cb) => jsDaemon.stop(cb),
      (cb) => js2Daemon.stop(cb)
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

  it('connect js <-> js', (done) => {
    let jsId
    let js2Id

    series([
      (cb) => parallel([
        (cb) => jsDaemon.api.id(cb),
        (cb) => js2Daemon.api.id(cb)
      ], (err, ids) => {
        expect(err).to.not.exist
        jsId = ids[0]
        js2Id = ids[1]
        cb()
      }),
      (cb) => js2Daemon.api.swarm.connect(jsId.addresses[0], cb),
      (cb) => jsDaemon.api.swarm.connect(js2Id.addresses[0], cb),
      (cb) => parallel([
        (cb) => js2Daemon.api.swarm.peers(cb),
        (cb) => jsDaemon.api.swarm.peers(cb)
      ], (err, peers) => {
        expect(err).to.not.exist
        expect(peers[0].map((p) => p.peer.toB58String())).to.include(jsId.id)
        expect(peers[1].map((p) => p.peer.toB58String())).to.include(js2Id.id)
        cb()
      })
    ], done)
  })

  describe('cat file', () => sizes.forEach((size) => {
    it(`go -> js: ${size}bytes`, (done) => {
      const data = crypto.randomBytes(size)
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

    it(`js -> go: ${size}bytes`, (done) => {
      const data = crypto.randomBytes(size)
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

    it(`js -> js: ${size}bytes`, (done) => {
      const data = crypto.randomBytes(size)
      waterfall([
        (cb) => js2Daemon.api.add(data, cb),
        (res, cb) => jsDaemon.api.cat(res[0].hash, cb),
        (stream, cb) => stream.pipe(bl(cb))
      ], (err, file) => {
        expect(err).to.not.exist
        expect(file).to.be.eql(data)
        done()
      })
    })
  }))
})
