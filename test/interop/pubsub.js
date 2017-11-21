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
      return callback()
    }
    if (Date.now() > ttl) {
      clearInterval(self)
      return callback(new Error("waitFor time expired"))
    }
  }, 500)
}

describe('pubsub', function () {
  this.timeout(4 * 1000)

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

  after(function (done) {
    this.timeout(50 * 1000)

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
        (cb) => goD.api.swarm.connect(jsLocalAddr, cb),
        (cb) => setTimeout(() => {
          cb()
        }, 1000)
      ], done)
    })
  })

  describe('ascii data', () => {
    const data = Buffer.from('hello world')

    it('publish from Go, subscribe on Go', (done) => {
      const topic = 'pubsub-go-go'
      let n = 0

      function checkMessage (msg) {
        ++n
        expect(msg.data.toString()).to.equal(data.toString())
        expect(msg).to.have.property('seqno')
        expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
        expect(msg).to.have.property('topicIDs').eql([topic])
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
        (cb) => goD.api.pubsub.subscribe(topic, checkMessage, cb),
        (cb) => setTimeout(() => { cb() }, 500),
        (cb) => jsD.api.pubsub.publish(topic, data, cb),
        (cb) => waitFor(() => n === 1, cb)
      ], done)
    })

    it('publish from Go, subscribe on JS', (done) => {
      const topic = 'pubsub-go-js'
      let n = 0

      function checkMessage (msg) {
        ++n
        expect(msg.data.toString()).to.equal(data.toString())
        expect(msg).to.have.property('seqno')
        expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
        expect(msg).to.have.property('topicIDs').eql([topic])
        expect(msg).to.have.property('from', goId)
      }

      series([
        (cb) => jsD.api.pubsub.subscribe(topic, checkMessage, cb),
        (cb) => setTimeout(() => { cb() }, 500),
        (cb) => goD.api.pubsub.publish(topic, data, cb),
        (cb) => waitFor(() => n === 1, cb),
      ], done)
    })
  })

  describe('non-ascii data', () => {
    const data = Buffer.from('你好世界')

    it('publish from Go, subscribe on Go', (done) => {
      const topic = 'pubsub-non-ascii-go-go'
      let n = 0

      function checkMessage (msg) {
        ++n
        expect(msg.data.toString()).to.equal(data.toString())
        expect(msg).to.have.property('seqno')
        expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
        expect(msg).to.have.property('topicIDs').eql([topic])
        expect(msg).to.have.property('from', goId)
      }

      series([
        (cb) => goD.api.pubsub.subscribe(topic, checkMessage, cb),
        (cb) => goD.api.pubsub.publish(topic, data, cb),
        (cb) => waitFor(() => n === 1, cb)
      ], done)
    })

    it('publish from JS, subscribe on JS', (done) => {
      const topic = 'pubsub-non-ascii-js-js'
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
      const topic = 'pubsub-non-ascii-js-go'
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
        (cb) => goD.api.pubsub.subscribe(topic, checkMessage, cb),
        (cb) => setTimeout(() => { cb() }, 500),
        (cb) => jsD.api.pubsub.publish(topic, data, cb),
        (cb) => waitFor(() => n === 1, cb)
      ], done)
    })

    it('publish from Go, subscribe on JS', (done) => {
      const topic = 'pubsub-non-ascii-go-js'
      let n = 0

      function checkMessage (msg) {
        ++n
        expect(msg.data.toString()).to.equal(data.toString())
        expect(msg).to.have.property('seqno')
        expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
        expect(msg).to.have.property('topicIDs').eql([topic])
        expect(msg).to.have.property('from', goId)
      }

      series([
        (cb) => jsD.api.pubsub.subscribe(topic, checkMessage, cb),
        (cb) => setTimeout(() => { cb() }, 500),
        (cb) => goD.api.pubsub.publish(topic, data, cb),
        (cb) => waitFor(() => n === 1, cb),
      ], done)
    })
  })

  describe('binary data', () => {
    const data = Buffer.from('a36161636179656162830103056164a16466666666f400010203040506070809', 'hex')

    it('publish from Go, subscribe on Go', (done) => {
      const topic = 'pubsub-binary-go-go'
      let n = 0

      function checkMessage (msg) {
        ++n
        expect(msg.data.toString('hex')).to.equal(data.toString('hex'))
        expect(msg).to.have.property('seqno')
        expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
        expect(msg).to.have.property('topicIDs').eql([topic])
        expect(msg).to.have.property('from', goId)
      }

      series([
        (cb) => goD.api.pubsub.subscribe(topic, checkMessage, cb),
        (cb) => setTimeout(() => { cb() }, 500),
        (cb) => goD.api.pubsub.publish(topic, data, cb),
        (cb) => waitFor(() => n === 1, cb)
      ], done)
    })

    it('publish from Go, subscribe on JS', (done) => {
      const topic = 'pubsub-binary-go-js'
      let n = 0

      function checkMessage (msg) {
        ++n
        expect(msg.data.toString('hex')).to.equal(data.toString('hex'))
        expect(msg).to.have.property('seqno')
        expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
        expect(msg).to.have.property('topicIDs').eql([topic])
        expect(msg).to.have.property('from', goId)
      }

      series([
        (cb) => jsD.api.pubsub.subscribe(topic, checkMessage, cb),
        (cb) => setTimeout(() => { cb() }, 500),
        (cb) => goD.api.pubsub.publish(topic, data, cb),
        (cb) => waitFor(() => n === 1, cb)
      ], done)
    })

    it('publish from JS, subscribe on Go', (done) => {
      const topic = 'pubsub-binary-js-go'
      let n = 0

      function checkMessage (msg) {
        ++n
        expect(msg.data.toString('hex')).to.equal(data.toString('hex'))
        expect(msg).to.have.property('seqno')
        expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
        expect(msg).to.have.property('topicIDs').eql([topic])
        expect(msg).to.have.property('from', jsId)
      }

      series([
        (cb) => goD.api.pubsub.subscribe(topic, checkMessage, cb),
        (cb) => setTimeout(() => { cb() }, 500),
        (cb) => jsD.api.pubsub.publish(topic, data, cb),
        (cb) => waitFor(() => n === 1, cb)
      ], done)
    })

    it('publish from JS, subscribe on JS', (done) => {
      const topic = 'pubsub-binary-js-js'
      let n = 0

      function checkMessage (msg) {
        ++n
        expect(msg.data.toString('hex')).to.equal(data.toString('hex'))
        expect(msg).to.have.property('seqno')
        expect(Buffer.isBuffer(msg.seqno)).to.be.eql(true)
        expect(msg).to.have.property('topicIDs').eql([topic])
        expect(msg).to.have.property('from', jsId)
      }

      series([
        (cb) => jsD.api.pubsub.subscribe(topic, checkMessage, cb),
        (cb) => setTimeout(() => { cb() }, 500),
        (cb) => jsD.api.pubsub.publish(topic, data, cb),
        (cb) => waitFor(() => n === 1, cb)
      ], done)
    })

  })
})
