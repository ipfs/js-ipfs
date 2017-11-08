/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const parallel = require('async/parallel')
const series = require('async/series')
const bl = require('bl')
const waterfall = require('async/waterfall')
const multiaddr = require('multiaddr')
const crypto = require('crypto')

const ads = require('../utils/another-daemon-spawner')
const js = ads.spawnJsNode
const go = ads.spawnGoNode
const stop = ads.stopNodes

describe.only('circuit interop', () => {
  let jsTCP
  let jsTCPAddrs
  let jsWS
  let jsWSAddrs
  let jsRelayAddrs

  let goRelayAddrs

  let goTCPAddrs
  let goTCP

  let goWSAddrs
  let goWS

  beforeEach((done) => {
    const base = '/ip4/127.0.0.1/tcp'

    parallel([
      (cb) => js([`${base}/61454/ws`, `${base}/61453`], true, cb),
      (cb) => js([`${base}/9002`], cb),
      (cb) => js([`${base}/9003/ws`], cb),
      (cb) => go([`${base}/0/ws`, `${base}/0`], true, cb),
      (cb) => go([`${base}/0`], cb),
      (cb) => go([`${base}/0/ws`], cb)
    ], (err, nodes) => {
      expect(err).to.not.exist()

      jsRelayAddrs = nodes[0][1].map((a) => a.toString()).filter((a) => !a.includes('/p2p-circuit'))
      jsTCP = nodes[1][0]
      jsTCPAddrs = nodes[1][1].map((a) => a.toString()).filter((a) => a.includes('/p2p-circuit'))
      jsWS = nodes[2][0]
      jsWSAddrs = nodes[2][1].map((a) => a.toString()).filter((a) => a.includes('/p2p-circuit'))

      goRelayAddrs = nodes[3][1]
      goTCP = nodes[4][0].api
      goTCPAddrs = nodes[4][1]
      goWS = nodes[5][0].api
      goWSAddrs = nodes[5][1]
      done()
    })
  })

  afterEach(() => stop())

  it('jsWS <-> jsRelay <-> jsTCP', (done) => {
    const data = crypto.randomBytes(128)
    series([
      (cb) => jsWS.swarm.connect(jsRelayAddrs[0], cb),
      (cb) => jsTCP.swarm.connect(jsRelayAddrs[1], cb),
      (cb) => setTimeout(cb, 1000),
      (cb) => jsTCP.swarm.connect(jsWSAddrs[0], cb)
    ], (err) => {
      expect(err).to.not.exist()
      waterfall([
        (cb) => jsTCP.files.add(data, cb),
        (res, cb) => jsWS.files.cat(res[0].hash, cb),
        (stream, cb) => stream.pipe(bl(cb))
      ], done)
    })
  })

  it('goWS <-> jsRelay <-> goTCP', (done) => {
    const data = crypto.randomBytes(128)
    series([
      (cb) => goWS.swarm.connect(jsRelayAddrs[0], cb),
      (cb) => goTCP.swarm.connect(jsRelayAddrs[1], cb),
      (cb) => setTimeout(cb, 1000),
      (cb) => goTCP.swarm.connect(`/p2p-circuit/ipfs/${multiaddr(goWSAddrs[0]).getPeerId()}`, cb)
    ], (err) => {
      expect(err).to.not.exist()
      waterfall([
        (cb) => goTCP.files.add(data, cb),
        (res, cb) => goWS.files.cat(res[0].hash, cb),
        (stream, cb) => stream.pipe(bl(cb))
      ], done)
    })
  })

  it('jsWS <-> jsRelay <-> goTCP', (done) => {
    const data = crypto.randomBytes(128)
    series([
      (cb) => jsWS.swarm.connect(jsRelayAddrs[0], cb),
      (cb) => goTCP.swarm.connect(jsRelayAddrs[1], cb),
      (cb) => setTimeout(cb, 1000),
      (cb) => goTCP.swarm.connect(jsWSAddrs[0], cb)
    ], (err) => {
      expect(err).to.not.exist()
      waterfall([
        (cb) => goTCP.files.add(data, cb),
        (res, cb) => jsWS.files.cat(res[0].hash, cb),
        (stream, cb) => stream.pipe(bl(cb))
      ], done)
    })
  })

  it('jsTCP <-> goRelay <-> jsWS', (done) => {
    const data = crypto.randomBytes(128)
    series([
      (cb) => jsTCP.swarm.connect(goRelayAddrs[2], cb),
      (cb) => jsWS.swarm.connect(goRelayAddrs[0], cb),
      (cb) => setTimeout(cb, 1000),
      (cb) => jsWS.swarm.connect(jsTCPAddrs[0], cb)
    ], (err) => {
      expect(err).to.not.exist()
      waterfall([
        (cb) => jsTCP.files.add(data, cb),
        (res, cb) => jsWS.files.cat(res[0].hash, cb),
        (stream, cb) => stream.pipe(bl(cb))
      ], done)
    })
  })

  it('goTCP <-> goRelay <-> goWS', (done) => {
    const data = crypto.randomBytes(128)
    series([
      (cb) => goWS.swarm.connect(goRelayAddrs[0], cb),
      (cb) => goTCP.swarm.connect(goRelayAddrs[2], cb),
      (cb) => setTimeout(cb, 1000),
      (cb) => goWS.swarm.connect(`/p2p-circuit/ipfs/${multiaddr(goTCPAddrs[0]).getPeerId()}`, cb)
    ], (err) => {
      expect(err).to.not.exist()
      waterfall([
        (cb) => goTCP.files.add(data, cb),
        (res, cb) => goWS.files.cat(res[0].hash, cb),
        (stream, cb) => stream.pipe(bl(cb))
      ], done)
    })
  })

  it('jsWS <-> goRelay <-> goTCP', (done) => {
    const data = crypto.randomBytes(128)
    series([
      (cb) => jsWS.swarm.connect(goRelayAddrs[0], cb),
      (cb) => goTCP.swarm.connect(goRelayAddrs[2], cb),
      (cb) => setTimeout(cb, 1000),
      (cb) => goTCP.swarm.connect(`/p2p-circuit/ipfs/${multiaddr(jsWSAddrs[0]).getPeerId()}`, cb)
    ], (err) => {
      expect(err).to.not.exist()
      waterfall([
        (cb) => goTCP.files.add(data, cb),
        (res, cb) => jsWS.files.cat(res[0].hash, cb),
        (stream, cb) => stream.pipe(bl(cb))
      ], done)
    })
  })
})
