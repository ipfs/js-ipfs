/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const series = require('async/series')
const parallel = require('async/parallel')

const GODaemon = require('../utils/interop-daemon-spawner/go')
const JSDaemon = require('../utils/interop-daemon-spawner/js')

/*
 * Wait for a condition to become true.  When its true, callback is called.
 */
function waitFor (predicate, callback) {
  const ttl = Date.now() + (2 * 1000)
  const self = setInterval(() => {
    if (predicate()) {
      clearInterval(self)
      callback()
    }
    if (Date.now() > ttl) {
      clearInterval(self)
      callback(new Error("waitFor time expired"))
    }
  }, 500)
}

describe('pubsub', function () {
  let jsD
  let goD
  let jsId
  let goId

  before(function (done) {
    this.timeout(50 * 1000)

    goD = new GODaemon({
      disposable: true,
      init: true,
      flags: ['--enable-pubsub-experiment']
    })
    jsD = new JSDaemon()

    parallel([
      (cb) => goD.start(cb),
      (cb) => jsD.start(cb)
    ], (done))
  })

  after((done) => {
    parallel([
      (cb) => goD.stop(cb),
      (cb) => jsD.stop(cb)
    ], done)
  })

  it('make connections', (done) => {
    series([
      (cb) => jsD.api.id(cb),
      (cb) => goD.api.id(cb)
    ], (err, ids) => {
      expect(err).to.not.exist()

      jsId = ids[0].id
      goId = ids[1].id

      const jsLocalAddr = ids[0].addresses.find(a => a.includes('127.0.0.1'))
      const goLocalAddr = ids[1].addresses.find(a => a.includes('127.0.0.1'))

      parallel([
        (cb) => jsD.api.swarm.connect(goLocalAddr, cb),
        (cb) => goD.api.swarm.connect(jsLocalAddr, cb)
      ], done)
    })
  })

  it('publish from Go, subscribe on Go', (done) => {
    const topic = 'pubsub-go-go'
    const data = Buffer.from('hello world')
    let n = 0

    function checkMessage (msg) {
      ++n
      expect(msg.data.toString()).to.equal(data.toString())
      expect(msg).to.have.property('seqno')
      expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
      // TODO: expect(msg).to.have.property('topicIDs').eql([topic])
      expect(msg).to.have.property('from', goId)
    }

    series([
      (cb) => goD.api.pubsub.subscribe(topic, checkMessage, cb),
      (cb) => goD.api.pubsub.publish(topic, data, cb),
      (cb) => waitFor(() => n === 1, cb)
    ], done)
  })

  it('publish from JS, subscribe on JS', (done) => {
    const topic = 'pubsub-js-js'
    const data = Buffer.from('hello world')
    let n = 0

    function checkMessage (msg) {
      ++n
      expect(msg.data.toString()).to.equal(data.toString())
      expect(msg).to.have.property('seqno')
      expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
      expect(msg).to.have.property('topicIDs').eql([topic])
      expect(msg).to.have.property('from', jsId)
    }

    series([
      (cb) => jsD.api.pubsub.subscribe(topic, checkMessage, cb),
      (cb) => jsD.api.pubsub.publish(topic, data, cb),
      (cb) => waitFor(() => n === 1, cb)
    ], done)
  })

  it('publish from JS, subscribe on Go', (done) => {
    const topic = 'pubsub-js-go'
    const data = Buffer.from('hello world')
    let n = 0

    function checkMessage (msg) {
      console.log('check message', msg)
      ++n
      expect(msg.data.toString()).to.equal(data.toString())
      expect(msg).to.have.property('seqno')
      expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
      expect(msg).to.have.property('topicIDs').eql([topic])
      expect(msg).to.have.property('from', jsId)
    }

    series([
      (cb) => goD.api.pubsub.subscribe(topic, checkMessage, cb),
      (cb) => jsD.api.pubsub.publish(topic, data, cb),
      (cb) => waitFor(() => n === 1, cb)
    ], done)
  })

  it('publish from Go, subscribe on JS', (done) => {
    const topic = 'pubsub-go-js'
    const data = Buffer.from('hello world')
    let n = 0

    function checkMessage (msg) {
      console.log('check message', msg)
      ++n
      expect(msg.data.toString()).to.equal(data.toString())
      expect(msg).to.have.property('seqno')
      expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
      expect(msg).to.have.property('topicIDs').eql([topic])
      expect(msg).to.have.property('from', goId)
    }

    series([
      (cb) => jsD.api.pubsub.subscribe(topic, checkMessage, cb),
      (cb) => goD.api.pubsub.publish(topic, data, cb),
      (cb) => waitFor(() => n === 1, cb),
    ], done)
  })
})
