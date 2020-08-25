/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const all = require('it-all')
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

    it('can ping without options', async () => {
      const res = await all(ipfsdA.api.ping(ipfsdBId))
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

    it('sends the specified number of packets', async () => {
      let packetNum = 0
      const count = 3

      for await (const res of ipfsdA.api.ping(ipfsdBId, { count })) {
        expect(res.success).to.be.true()
        // It's a pong
        if (isPong(res)) {
          packetNum++
        }
      }

      expect(packetNum).to.equal(count)
    })

    it('pinging a not available peer will fail accordingly', async () => {
      const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      let messageNum = 0
      const count = 1

      try {
        for await (const { text } of ipfsdA.api.ping(unknownPeerId, {})) {
          messageNum++
          // Assert that the ping command falls back to the peerRouting
          if (messageNum === 1) {
            expect(text).to.include('Looking up')
          }
        }
      } catch (err) {
        expect(messageNum).to.equal(count)
        return
      }

      throw new Error('expected an error')
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

      bMultiaddr = ipfsdB.api.peerId.addresses[0]
      cMultiaddr = ipfsdC.api.peerId.addresses[0]
      ipfsdCId = ipfsdC.api.peerId.id
    })

    // Connect the nodes
    before(async function () {
      this.timeout(30 * 1000)
      await ipfsdA.api.swarm.connect(bMultiaddr)
      await ipfsdB.api.swarm.connect(cMultiaddr)
    })

    after(() => df.clean())

    it('if enabled uses the DHT peer routing to find peer', async () => {
      let messageNum = 0
      let packetNum = 0
      const count = 3

      for await (const res of ipfsdA.api.ping(ipfsdCId, { count })) {
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
      }

      expect(packetNum).to.equal(count)
    })
  })
})
