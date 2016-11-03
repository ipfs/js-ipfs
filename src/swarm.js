/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const expect = require('chai').expect
const series = require('async/series')

module.exports = (common) => {
  describe('.swarm', () => {
    let ipfsA
    let ipfsB

    before(function (done) {
      // CI takes longer to instantiate the daemon,
      // so we need to increase the timeout for the
      // before step
      this.timeout(20 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist
        series([
          (cb) => {
            factory.spawnNode((err, node) => {
              expect(err).to.not.exist
              ipfsA = node
              cb()
            })
          },
          (cb) => {
            factory.spawnNode((err, node) => {
              expect(err).to.not.exist
              ipfsB = node
              cb()
            })
          }
        ], done)
      })
    })

    after((done) => {
      common.teardown(done)
    })

    describe('callback API', () => {
      it('.connect', (done) => {
        ipfsB.id((err, id) => {
          expect(err).to.not.exist

          const ipfsBAddr = id.addresses[0]
          ipfsA.swarm.connect(ipfsBAddr, done)
        })
      })

      it('.peers', (done) => {
        ipfsA.swarm.peers((err, multiaddrs) => {
          expect(err).to.not.exist
          expect(multiaddrs).to.have.length.above(0)
          done()
        })
      })

      it('.addrs', (done) => {
        ipfsA.swarm.addrs((err, multiaddrs) => {
          expect(err).to.not.exist
          expect(multiaddrs).to.not.be.empty
          expect(multiaddrs).to.be.an('array')
          expect(multiaddrs[0].constructor.name).to.be.eql('PeerInfo')
          done()
        })
      })

      it('.localAddrs', (done) => {
        ipfsA.swarm.localAddrs((err, multiaddrs) => {
          expect(err).to.not.exist
          expect(multiaddrs).to.have.length.above(0)
          done()
        })
      })

      it('.disconnect', (done) => {
        ipfsB.id((err, id) => {
          expect(err).to.not.exist
          const ipfsBAddr = id.addresses[0]
          ipfsA.swarm.disconnect(ipfsBAddr, done)
        })
      })
    })

    describe('promise API', () => {
      it('.connect', () => {
        return ipfsB.id()
          .then((id) => {
            const ipfsBAddr = id.addresses[0]
            return ipfsA.swarm.connect(ipfsBAddr)
          })
      })

      it('.peers', () => {
        return ipfsA.swarm.peers().then((multiaddrs) => {
          expect(multiaddrs).to.have.length.above(0)
        })
      })

      it('.addrs', () => {
        return ipfsA.swarm.addrs().then((multiaddrs) => {
          expect(multiaddrs).to.have.length.above(0)
        })
      })

      it('.localAddrs', () => {
        return ipfsA.swarm.localAddrs().then((multiaddrs) => {
          expect(multiaddrs).to.have.length.above(0)
        })
      })

      it('.disconnect', () => {
        return ipfsB.id()
          .then((id) => {
            const ipfsBAddr = id.addresses[0]
            return ipfsA.swarm.disconnect(ipfsBAddr)
          })
      })
    })
  })
}
