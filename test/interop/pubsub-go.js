/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const series = require('async/series')
const parallel = require('async/parallel')

const GODaemon = require('../utils/interop-daemon-spawner/go')

/*
 * Wait for a condition to become true.  When its true, callback is called.
 */
function waitFor (predicate, callback) {
  const ttl = Date.now() + (2 * 1000)
  const self = setInterval(() => {
    if (predicate()) {
      clearInterval(self)
      return callback()
    }
    if (Date.now() > ttl) {
      clearInterval(self)
      return callback(new Error("waitFor time expired"))
    }
  }, 500)
}

describe('pubsub GO 2 GO', function () {
  this.timeout(4 * 1000)

  let go1D
  let go2D
  let go1Id
  let go2Id

  before(function (done) {
    this.timeout(50 * 1000)

    go1D = new GODaemon({
      disposable: true,
      init: true,
      flags: ['--enable-pubsub-experiment']
    })
    go2D = new GODaemon({
      disposable: true,
      init: true,
      flags: ['--enable-pubsub-experiment']
    })

    parallel([
      (cb) => go1D.start(cb),
      (cb) => go2D.start(cb)
    ], (done))
  })

  after((done) => {
    parallel([
      (cb) => go1D.stop(cb),
      (cb) => go2D.stop(cb)
    ], done)
  })

  it('make connections', (done) => {
    series([
      (cb) => go1D.api.id(cb),
      (cb) => go2D.api.id(cb)
    ], (err, ids) => {
      expect(err).to.not.exist()

      go1Id = ids[0].id
      go2Id = ids[1].id

      const go1LocalAddr = ids[0].addresses.find(a => a.includes('127.0.0.1'))
      const go2LocalAddr = ids[1].addresses.find(a => a.includes('127.0.0.1'))

      parallel([
        (cb) => go1D.api.swarm.connect(go2LocalAddr, cb),
        (cb) => go2D.api.swarm.connect(go1LocalAddr, cb),
        (cb) => setTimeout(() => {
          cb()
        }, 1000)
      ], done)
    })
  })

  it('publish from Go2, subscribe on Go1', (done) => {
    const topic = 'pubsub-go2-go1'
    const data = Buffer.from('hello world')
    let n = 0

    function checkMessage (msg) {
      ++n
      expect(msg.data.toString()).to.equal(data.toString())
      expect(msg).to.have.property('seqno')
      expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
      expect(msg).to.have.property('topicIDs').eql([topic])
      expect(msg).to.have.property('from', go2Id)
    }

    series([
      (cb) => go1D.api.pubsub.subscribe(topic, checkMessage, cb),
      (cb) => setTimeout(() => { cb() }, 500),
      (cb) => go2D.api.pubsub.publish(topic, data, cb),
      (cb) => go2D.api.pubsub.publish(topic, data, cb),
      (cb) => go2D.api.pubsub.publish(topic, data, cb),
      (cb) => waitFor(() => n === 3, cb)
    ], done)
  })

  it('publish binary data', (done) => {
    const topic = 'pubsub-binary-go1-go2'
    const data = Buffer.from('00010203040506070809', 'hex')
    let n = 0

    function checkMessage (msg) {
      ++n
      expect(msg.data.toString('hex')).to.equal(data.toString('hex'))
      expect(msg).to.have.property('seqno')
      expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
      expect(msg).to.have.property('topicIDs').eql([topic])
      expect(msg).to.have.property('from', go2Id)
    }

    series([
      (cb) => go1D.api.pubsub.subscribe(topic, checkMessage, cb),
      (cb) => setTimeout(() => { cb() }, 500),
      (cb) => go2D.api.pubsub.publish(topic, data, cb),
      (cb) => waitFor(() => n === 1, cb)
    ], done)
  })

})
