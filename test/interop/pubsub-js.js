/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const series = require('async/series')
const parallel = require('async/parallel')

const JSDaemon = require('../utils/interop-daemon-spawner/js')

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

describe('pubsub JS 2 JS', function () {
  this.timeout(4 * 1000)

  let js1D
  let js2D
  let js1Id
  let js2Id

  before(function (done) {
    this.timeout(50 * 1000)

    js1D = new JSDaemon()
    js2D = new JSDaemon({
      disposable: true,
      init: true,
      port: 2
    })

    parallel([
      (cb) => js1D.start(cb),
      (cb) => js2D.start(cb)
    ], (done))
  })

  after(function (done) {
    this.timeout(10 * 1000)

    parallel([
      (cb) => js1D.stop(cb),
      (cb) => js2D.stop(cb)
    ], done)
  })

  it('make connections', (done) => {
    series([
      (cb) => js1D.api.id(cb),
      (cb) => js2D.api.id(cb)
    ], (err, ids) => {
      expect(err).to.not.exist()

      js1Id = ids[0].id
      js2Id = ids[1].id

      const js1LocalAddr = ids[0].addresses.find(a => a.includes('127.0.0.1'))
      const js2LocalAddr = ids[1].addresses.find(a => a.includes('127.0.0.1'))

      parallel([
        (cb) => js1D.api.swarm.connect(js2LocalAddr, cb),
        (cb) => js2D.api.swarm.connect(js1LocalAddr, cb),
        (cb) => setTimeout(() => {
          cb()
        }, 1000)
      ], done)
    })
  })

  it('publish from JS2, subscribe on JS1', (done) => {
    const topic = 'pubsub-js2-js1'
    const data = Buffer.from('hello world')
    let n = 0

    function checkMessage (msg) {
      ++n
      expect(msg.data.toString()).to.equal(data.toString())
      expect(msg).to.have.property('seqno')
      expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
      expect(msg).to.have.property('topicIDs').eql([topic])
      expect(msg).to.have.property('from', js2Id)
    }

    series([
      (cb) => js1D.api.pubsub.subscribe(topic, checkMessage, cb),
      (cb) => setTimeout(() => { cb() }, 500),
      (cb) => js2D.api.pubsub.publish(topic, data, cb),
      (cb) => js2D.api.pubsub.publish(topic, data, cb),
      (cb) => js2D.api.pubsub.publish(topic, data, cb),
      (cb) => waitFor(() => n === 3, cb)
    ], done)
  })

  it('publish binary data', (done) => {
    const topic = 'pubsub-binary-js1-js2'
    const data = Buffer.from('00010203040506070809', 'hex')
    let n = 0

    function checkMessage (msg) {
      ++n
      expect(msg.data.toString('hex')).to.equal(data.toString('hex'))
      expect(msg).to.have.property('seqno')
      expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
      expect(msg).to.have.property('topicIDs').eql([topic])
      expect(msg).to.have.property('from', js2Id)
    }

    series([
      (cb) => js1D.api.pubsub.subscribe(topic, checkMessage, cb),
      (cb) => setTimeout(() => { cb() }, 500),
      (cb) => js2D.api.pubsub.publish(topic, data, cb),
      (cb) => waitFor(() => n === 1, cb)
    ], done)
  })

})
