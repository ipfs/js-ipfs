/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const series = require('async/series')
const ipfsExec = require('../utils/ipfs-exec')
const Factory = require('../utils/ipfs-factory-daemon')

describe('swarm', () => {
  let factory
  let bMultiaddr
  let ipfsA

  before(function (done) {
    // CI takes longer to instantiate the daemon,
    // so we need to increase the timeout for the
    // before step
    this.timeout(20 * 1000)

    factory = new Factory()

    series([
      (cb) => {
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist
          ipfsA = ipfsExec(node.repoPath)
          cb()
        })
      },
      (cb) => {
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist
          node.id((err, id) => {
            expect(err).to.not.exist
            bMultiaddr = id.addresses[0]
            cb()
          })
        })
      }
    ], done)
  })

  after((done) => factory.dismantle(done))

  describe('daemon on (through http-api)', () => {
    it('connect', () => {
      return ipfsA('swarm', 'connect', bMultiaddr).then((out) => {
        expect(out).to.eql(`connect ${bMultiaddr} success`)
      })
    })

    it('peers', () => {
      return ipfsA('swarm peers').then((out) => {
        expect(out).to.be.eql(bMultiaddr)
      })
    })

    it('addrs', () => {
      return ipfsA('swarm addrs').then((out) => {
        expect(out).to.have.length.above(0)
      })
    })

    it('addrs local', () => {
      return ipfsA('swarm addrs local').then((out) => {
        expect(out).to.have.length.above(0)
      })
    })

    it('disconnect', () => {
      return ipfsA('swarm', 'disconnect', bMultiaddr).then((out) => {
        expect(out).to.eql(
          `disconnect ${bMultiaddr} success`
        )
      })
    })
  })
})
