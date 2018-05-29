/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const pull = require('pull-stream')
const collect = require('pull-stream/sinks/collect')
const expect = chai.expect
chai.use(dirtyChai)

const parallel = require('async/parallel')
const series = require('async/series')

const IPFSApi = require('../src')
const PingMessageStream = require('../src/utils/ping-message-stream')
const f = require('./utils/factory')

// Determine if a ping response object is a pong, or something else, like a status message
function isPong (pingResponse) {
  return Boolean(pingResponse && pingResponse.success && !pingResponse.text)
}

describe('.ping', function () {
  let ipfs
  let ipfsd
  let other
  let otherd
  let otherId

  before(function (done) {
    this.timeout(20 * 1000) // slow CI

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
        ipfsd.api.id((err, id) => {
          expect(err).to.not.exist()
          const ma = id.addresses[0]
          other.swarm.connect(ma, cb)
        })
      },
      (cb) => {
        other.id((err, id) => {
          expect(err).to.not.exist()
          otherId = id.id
          cb()
        })
      }
    ], done)
  })

  after((done) => {
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

  it('.ping with default n', (done) => {
    ipfs.ping(otherId, (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.be.an('array')
      expect(res.filter(isPong)).to.have.lengthOf(1)
      res.forEach(packet => {
        expect(packet).to.have.keys('success', 'time', 'text')
        expect(packet.time).to.be.a('number')
      })
      const resultMsg = res.find(packet => packet.text.includes('Average latency'))
      expect(resultMsg).to.exist()
      done()
    })
  })

  it('.ping with count = 2', (done) => {
    ipfs.ping(otherId, { count: 2 }, (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.be.an('array')
      expect(res.filter(isPong)).to.have.lengthOf(2)
      res.forEach(packet => {
        expect(packet).to.have.keys('success', 'time', 'text')
        expect(packet.time).to.be.a('number')
      })
      const resultMsg = res.find(packet => packet.text.includes('Average latency'))
      expect(resultMsg).to.exist()
      done()
    })
  })

  it('.ping with n = 2', (done) => {
    ipfs.ping(otherId, { n: 2 }, (err, res) => {
      expect(err).to.not.exist()
      expect(res).to.be.an('array')
      expect(res.filter(isPong)).to.have.lengthOf(2)
      res.forEach(packet => {
        expect(packet).to.have.keys('success', 'time', 'text')
        expect(packet.time).to.be.a('number')
      })
      const resultMsg = res.find(packet => packet.text.includes('Average latency'))
      expect(resultMsg).to.exist()
      done()
    })
  })

  it('.ping fails with count & n', function (done) {
    this.timeout(20 * 1000)

    ipfs.ping(otherId, {count: 2, n: 2}, (err, res) => {
      expect(err).to.exist()
      done()
    })
  })

  it('.ping with Promises', () => {
    return ipfs.ping(otherId)
      .then((res) => {
        expect(res).to.be.an('array')
        expect(res.filter(isPong)).to.have.lengthOf(1)
        res.forEach(packet => {
          expect(packet).to.have.keys('success', 'time', 'text')
          expect(packet.time).to.be.a('number')
        })
        const resultMsg = res.find(packet => packet.text.includes('Average latency'))
        expect(resultMsg).to.exist()
      })
  })

  it('.pingPullStream', (done) => {
    pull(
      ipfs.pingPullStream(otherId),
      collect((err, data) => {
        expect(err).to.not.exist()
        expect(data).to.be.an('array')
        expect(data.filter(isPong)).to.have.lengthOf(1)
        data.forEach(packet => {
          expect(packet).to.have.keys('success', 'time', 'text')
          expect(packet.time).to.be.a('number')
        })
        const resultMsg = data.find(packet => packet.text.includes('Average latency'))
        expect(resultMsg).to.exist()
        done()
      })
    )
  })

  it('.pingReadableStream', (done) => {
    let packetNum = 0
    ipfs.pingReadableStream(otherId)
      .on('data', data => {
        expect(data).to.be.an('object')
        expect(data).to.have.keys('success', 'time', 'text')
        if (isPong(data)) packetNum++
      })
      .on('error', err => {
        expect(err).not.to.exist()
      })
      .on('end', () => {
        expect(packetNum).to.equal(1)
        done()
      })
  })

  it('message conversion fails if invalid message is received', () => {
    const messageConverter = new PingMessageStream()
    expect(() => {
      messageConverter.write({some: 'InvalidMessage'})
    }).to.throw('Invalid ping message received')
  })
})
