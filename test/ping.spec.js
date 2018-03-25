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
const f = require('./utils/factory')

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
        console.log('going to spawn second node')
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
      (cb) => ipfsd.stop(cb),
      (cb) => otherd.stop(cb)
    ], done)
  })

  describe('callback API', () => {
    it('ping another peer with default packet count', (done) => {
      ipfs.ping(otherId, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.be.an('array')
        expect(res).to.have.lengthOf(3)
        res.forEach(packet => {
          expect(packet).to.have.keys('Success', 'Time', 'Text')
          expect(packet.Time).to.be.a('number')
        })
        const resultMsg = res.find(packet => packet.Text.includes('Average latency'))
        expect(resultMsg).to.exist()
        done()
      })
    })

    it('ping another peer with a specifc packet count through parameter count', (done) => {
      ipfs.ping(otherId, {count: 3}, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.be.an('array')
        expect(res).to.have.lengthOf(5)
        res.forEach(packet => {
          expect(packet).to.have.keys('Success', 'Time', 'Text')
          expect(packet.Time).to.be.a('number')
        })
        const resultMsg = res.find(packet => packet.Text.includes('Average latency'))
        expect(resultMsg).to.exist()
        done()
      })
    })

    it('ping another peer with a specifc packet count through parameter n', (done) => {
      ipfs.ping(otherId, {n: 3}, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.be.an('array')
        expect(res).to.have.lengthOf(5)
        res.forEach(packet => {
          expect(packet).to.have.keys('Success', 'Time', 'Text')
          expect(packet.Time).to.be.a('number')
        })
        const resultMsg = res.find(packet => packet.Text.includes('Average latency'))
        expect(resultMsg).to.exist()
        done()
      })
    })

    it('sending both n and count should fail', (done) => {
      ipfs.ping(otherId, {count: 10, n: 10}, (err, res) => {
        expect(err).to.exist()
        done()
      })
    })
  })

  describe('promise API', () => {
    it('ping another peer with default packet count', () => {
      return ipfs.ping(otherId)
        .then((res) => {
          expect(res).to.be.an('array')
          expect(res).to.have.lengthOf(3)
          res.forEach(packet => {
            expect(packet).to.have.keys('Success', 'Time', 'Text')
            expect(packet.Time).to.be.a('number')
          })
          const resultMsg = res.find(packet => packet.Text.includes('Average latency'))
          expect(resultMsg).to.exist()
        })
    })

    it('ping another peer with a specifc packet count through parameter count', () => {
      return ipfs.ping(otherId, {count: 3})
        .then((res) => {
          expect(res).to.be.an('array')
          expect(res).to.have.lengthOf(5)
          res.forEach(packet => {
            expect(packet).to.have.keys('Success', 'Time', 'Text')
            expect(packet.Time).to.be.a('number')
          })
          const resultMsg = res.find(packet => packet.Text.includes('Average latency'))
          expect(resultMsg).to.exist()
        })
    })

    it('ping another peer with a specifc packet count through parameter n', () => {
      return ipfs.ping(otherId, {n: 3})
        .then((res) => {
          expect(res).to.be.an('array')
          expect(res).to.have.lengthOf(5)
          res.forEach(packet => {
            expect(packet).to.have.keys('Success', 'Time', 'Text')
            expect(packet.Time).to.be.a('number')
          })
          const resultMsg = res.find(packet => packet.Text.includes('Average latency'))
          expect(resultMsg).to.exist()
        })
    })

    it('sending both n and count should fail', (done) => {
      ipfs.ping(otherId, {n: 3, count: 3})
        .catch(err => {
          expect(err).to.exist()
          done()
        })
    })
  })

  describe('pull stream API', () => {
    it('ping another peer with the default packet count', (done) => {
      pull(
        ipfs.pingPullStream(otherId),
        collect((err, data) => {
          expect(err).to.not.exist()
          expect(data).to.be.an('array')
          expect(data).to.have.lengthOf(3)
          data.forEach(packet => {
            expect(packet).to.have.keys('Success', 'Time', 'Text')
            expect(packet.Time).to.be.a('number')
          })
          const resultMsg = data.find(packet => packet.Text.includes('Average latency'))
          expect(resultMsg).to.exist()
          done()
        })
      )
    })

    it('ping another peer with a specifc packet count through parameter count', (done) => {
      pull(
        ipfs.pingPullStream(otherId, {count: 3}),
        collect((err, data) => {
          expect(err).to.not.exist()
          expect(data).to.be.an('array')
          expect(data).to.have.lengthOf(5)
          data.forEach(packet => {
            expect(packet).to.have.keys('Success', 'Time', 'Text')
            expect(packet.Time).to.be.a('number')
          })
          const resultMsg = data.find(packet => packet.Text.includes('Average latency'))
          expect(resultMsg).to.exist()
          done()
        })
      )
    })

    it('ping another peer with a specifc packet count through parameter n', (done) => {
      pull(
        ipfs.pingPullStream(otherId, {n: 3}),
        collect((err, data) => {
          expect(err).to.not.exist()
          expect(data).to.be.an('array')
          expect(data).to.have.lengthOf(5)
          data.forEach(packet => {
            expect(packet).to.have.keys('Success', 'Time', 'Text')
            expect(packet.Time).to.be.a('number')
          })
          const resultMsg = data.find(packet => packet.Text.includes('Average latency'))
          expect(resultMsg).to.exist()
          done()
        })
      )
    })

    it('sending both n and count should fail', (done) => {
      pull(
        ipfs.pingPullStream(otherId, {n: 3, count: 3}),
        collect(err => {
          expect(err).to.exist()
          done()
        })
      )
    })
  })

  describe('readable stream API', () => {
    it('ping another peer with the default packet count', (done) => {
      let packetNum = 0
      ipfs.pingReadableStream(otherId)
        .on('data', data => {
          packetNum++
          expect(data).to.be.an('object')
          expect(data).to.have.keys('Success', 'Time', 'Text')
        })
        .on('error', err => {
          expect(err).not.to.exist()
        })
        .on('end', () => {
          expect(packetNum).to.equal(3)
          done()
        })
    })

    it('ping another peer with a specifc packet count through parameter count', (done) => {
      let packetNum = 0
      ipfs.pingReadableStream(otherId, {count: 3})
        .on('data', data => {
          packetNum++
          expect(data).to.be.an('object')
          expect(data).to.have.keys('Success', 'Time', 'Text')
        })
        .on('error', err => {
          expect(err).not.to.exist()
        })
        .on('end', () => {
          expect(packetNum).to.equal(5)
          done()
        })
    })

    it('ping another peer with a specifc packet count through parameter n', (done) => {
      let packetNum = 0
      ipfs.pingReadableStream(otherId, {n: 3})
        .on('data', data => {
          packetNum++
          expect(data).to.be.an('object')
          expect(data).to.have.keys('Success', 'Time', 'Text')
        })
        .on('error', err => {
          expect(err).not.to.exist()
        })
        .on('end', () => {
          expect(packetNum).to.equal(5)
          done()
        })
    })

    it('sending both n and count should fail', (done) => {
      ipfs.pingReadableStream(otherId, {n: 3, count: 3})
        .on('error', err => {
          expect(err).to.exist()
          done()
        })
    })
  })
})
