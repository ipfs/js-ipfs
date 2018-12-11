/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const pull = require('pull-stream/pull')
const drain = require('pull-stream/sinks/drain')
const parallel = require('async/parallel')
const series = require('async/series')
const DaemonFactory = require('ipfsd-ctl')
const isNode = require('detect-node')

const expect = chai.expect
chai.use(dirtyChai)
const df = DaemonFactory.create({ exec: 'src/cli/bin.js' })
const dfProc = DaemonFactory.create({
  exec: require('../../'),
  type: 'proc'
})

const config = {
  Bootstrap: [],
  Discovery: {
    MDNS: {
      Enabled:
        false
    }
  }
}

function spawnNode ({ dht = false, type = 'js' }, cb) {
  const args = dht ? [] : ['--local']
  const factory = type === 'js' ? df : dfProc
  factory.spawn({
    args,
    config,
    initOptions: { bits: 512 }
  }, cb)
}

// Determine if a ping response object is a pong, or something else, like a status message
function isPong (pingResponse) {
  return Boolean(pingResponse && pingResponse.success && !pingResponse.text)
}

describe('ping', function () {
  this.timeout(60 * 1000)

  if (!isNode) return

  describe('in-process daemon', function () {
    let ipfsdA
    let ipfsdB
    let bMultiaddr
    let ipfsdBId

    // Spawn nodes
    before(function (done) {
      this.timeout(60 * 1000)

      series([
        spawnNode.bind(null, { dht: false, type: 'proc' }),
        spawnNode.bind(null, { dht: false })
      ], (err, ipfsd) => {
        expect(err).to.not.exist()
        ipfsdA = ipfsd[0]
        ipfsdB = ipfsd[1]
        done()
      })
    })

    // Get the peer info object
    before(async function () {
      this.timeout(60 * 1000)

      const peerInfo = await ipfsdB.api.id()

      ipfsdBId = peerInfo.id
      bMultiaddr = peerInfo.addresses[0]
    })

    // Connect the nodes
    before(async function () {
      this.timeout(60 * 1000)
      await ipfsdA.api.swarm.connect(bMultiaddr)
    })

    after(async () => {
      if (!ipfsdA) return
      await ipfsdA.stop()
    })

    after(async () => {
      if (!ipfsdB) return
      await ipfsdB.stop()
    })

    it('can ping via a promise without options', async () => {
      const res = await ipfsdA.api.ping(ipfsdBId)

      expect(res.length).to.be.ok()
      expect(res[0].success).to.be.true()
    })
  })

  describe('DHT disabled', function () {
    // Without DHT nodes need to be previously connected
    let ipfsdA
    let ipfsdB
    let bMultiaddr
    let ipfsdBId

    // Spawn nodes
    before(function (done) {
      this.timeout(60 * 1000)

      series([
        spawnNode.bind(null, { dht: false }),
        spawnNode.bind(null, { dht: false })
      ], (err, ipfsd) => {
        expect(err).to.not.exist()
        ipfsdA = ipfsd[0]
        ipfsdB = ipfsd[1]
        done()
      })
    })

    // Get the peer info object
    before(function (done) {
      this.timeout(60 * 1000)

      ipfsdB.api.id((err, peerInfo) => {
        expect(err).to.not.exist()
        ipfsdBId = peerInfo.id
        bMultiaddr = peerInfo.addresses[0]
        done()
      })
    })

    // Connect the nodes
    before(function (done) {
      this.timeout(60 * 1000)
      ipfsdA.api.swarm.connect(bMultiaddr, done)
    })

    after((done) => {
      if (!ipfsdA) return done()
      ipfsdA.stop(done)
    })

    after((done) => {
      if (!ipfsdB) return done()
      ipfsdB.stop(done)
    })

    it('sends the specified number of packets', (done) => {
      let packetNum = 0
      const count = 3
      pull(
        ipfsdA.api.pingPullStream(ipfsdBId, { count }),
        drain((res) => {
          expect(res.success).to.be.true()
          // It's a pong
          if (isPong(res)) {
            packetNum++
          }
        }, (err) => {
          expect(err).to.not.exist()
          expect(packetNum).to.equal(count)
          done()
        })
      )
    })

    it('pinging a not available peer will fail accordingly', (done) => {
      const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      let messageNum = 0
      // const count = 1
      pull(
        ipfsdA.api.pingPullStream(unknownPeerId, {}),
        drain(({ success, time, text }) => {
          messageNum++
          // Assert that the ping command falls back to the peerRouting
          if (messageNum === 1) {
            expect(text).to.include('Looking up')
          }
        }, (err) => {
          expect(err).to.exist()
          // FIXME when we can have streaming
          // expect(messageNum).to.equal(count)
          done()
        })
      )
    })
  })

  describe('DHT enabled', function () {
    // Our bootstrap process will run 3 IPFS daemons where
    // A ----> B ----> C
    // Allowing us to test the ping command using the DHT peer routing
    let ipfsdA
    let ipfsdB
    let ipfsdC
    let bMultiaddr
    let cMultiaddr
    let ipfsdCId

    // Spawn nodes
    before(function (done) {
      this.timeout(60 * 1000)

      series([
        spawnNode.bind(null, { dht: true }),
        spawnNode.bind(null, { dht: true }),
        spawnNode.bind(null, { dht: true })
      ], (err, ipfsd) => {
        expect(err).to.not.exist()
        ipfsdA = ipfsd[0]
        ipfsdB = ipfsd[1]
        ipfsdC = ipfsd[2]
        done()
      })
    })

    // Get the peer info objects
    before(function (done) {
      this.timeout(60 * 1000)

      parallel([
        ipfsdB.api.id.bind(ipfsdB.api),
        ipfsdC.api.id.bind(ipfsdC.api)
      ], (err, peerInfo) => {
        expect(err).to.not.exist()
        bMultiaddr = peerInfo[0].addresses[0]
        ipfsdCId = peerInfo[1].id
        cMultiaddr = peerInfo[1].addresses[0]
        done()
      })
    })

    // Connect the nodes
    before(function (done) {
      this.timeout(30 * 1000)
      let interval

      // Check to see if peers are already connected
      const checkConnections = () => {
        ipfsdB.api.swarm.peers((err, peerInfos) => {
          if (err) return done(err)

          if (peerInfos.length > 1) {
            clearInterval(interval)
            return done()
          }
        })
      }

      parallel([
        ipfsdA.api.swarm.connect.bind(ipfsdA.api, bMultiaddr),
        ipfsdB.api.swarm.connect.bind(ipfsdB.api, cMultiaddr)
      ], (err) => {
        if (err) return done(err)
        interval = setInterval(checkConnections, 300)
      })
    })

    after((done) => {
      if (!ipfsdA) return done()
      ipfsdA.stop(done)
    })

    after((done) => {
      if (!ipfsdB) return done()
      ipfsdB.stop(done)
    })

    after((done) => {
      if (!ipfsdC) return done()
      ipfsdC.stop(done)
    })

    it('if enabled uses the DHT peer routing to find peer', (done) => {
      let messageNum = 0
      let packetNum = 0
      const count = 3
      pull(
        ipfsdA.api.pingPullStream(ipfsdCId, { count }),
        drain((res) => {
          messageNum++
          expect(res.success).to.be.true()
          // Assert that the ping command falls back to the peerRouting
          if (messageNum === 1) {
            expect(res.text).to.include('Looking up')
          }
          // It's a pong
          if (isPong(res)) {
            packetNum++
          }
        }, (err) => {
          expect(err).to.not.exist()
          expect(packetNum).to.equal(count)
          done()
        })
      )
    })
  })
})
