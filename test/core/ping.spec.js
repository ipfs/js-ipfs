/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const pull = require('pull-stream/pull')
const drain = require('pull-stream/sinks/drain')
const parallel = require('async/parallel')
const factory = require('../utils/factory')

// Determine if a ping response object is a pong, or something else, like a status message
function isPong (pingResponse) {
  return Boolean(pingResponse && pingResponse.success && !pingResponse.text)
}

describe('ping', function () {
  this.timeout(60 * 1000)
  const df = factory()

  describe('in-process daemon', function () {
    let ipfsdA
    let ipfsdB
    let bMultiaddr
    let ipfsdBId

    // Spawn nodes
    before(async function () {
      ipfsdA = await df.spawn({ type: 'proc' })
      ipfsdB = await df.spawn({ type: 'js' })
      ipfsdBId = ipfsdB.api.peerId.id
      bMultiaddr = ipfsdB.api.peerId.addresses[0]
      await ipfsdA.api.swarm.connect(bMultiaddr)
    })

    after(() => df.clean())

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
    before(async function () {
      ipfsdA = await df.spawn({ type: 'proc' })
      ipfsdB = await df.spawn({ type: 'js' })
      ipfsdBId = ipfsdB.api.peerId.id
      bMultiaddr = ipfsdB.api.peerId.addresses[0]
      await ipfsdA.api.swarm.connect(bMultiaddr)
    })

    after(() => df.clean())

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

  // TODO: unskip when DHT is enabled: https://github.com/ipfs/js-ipfs/pull/1994
  describe.skip('DHT enabled', function () {
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
    before(async function () {
      this.timeout(60 * 1000)

      ipfsdA = await df.spawn({ type: 'proc' })
      ipfsdB = await df.spawn({ type: 'proc' })
      ipfsdC = await df.spawn({ type: 'proc' })
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

    after(() => df.clean())

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
