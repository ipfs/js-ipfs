/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

const createTempNode = require('../utils/temp-node')

describe('swarm', function () {
  this.timeout(20000)

  var ipfsA
  var ipfsB
  var ipfsAAddr

  before((done) => {
    createTempNode(2, (err, ipfs) => {
      expect(err).to.not.exist
      ipfsA = ipfs

      createTempNode(3, (err, ipfs) => {
        expect(err).to.not.exist
        ipfsB = ipfs
        done()
      })
    })
  })

  before((done) => {
    ipfsA.id((err, res) => {
      expect(err).to.not.exist
      ipfsAAddr = `${res.Addresses[0]}/ipfs/${res.ID}`
      done()
    })
  })

  it('start', (done) => {
    ipfsA.goOnline((err) => {
      expect(err).to.not.exist
      ipfsB.goOnline((err) => {
        expect(err).to.not.exist
        done()
      })
    })
  })

  it('connect', (done) => {
    ipfsB.libp2p.swarm.connect(ipfsAAddr, (err, res) => {
      expect(err).to.not.exist
      done()
    })
  })

  it('peers', (done) => {
    ipfsB.libp2p.swarm.peers((err, res) => {
      expect(err).to.not.exist
      expect(Object.keys(res)).to.have.length(1)
      done()
    })
  })

  it('localAddrs', (done) => {
    ipfsB.libp2p.swarm.localAddrs((err, res) => {
      expect(err).to.not.exist
      expect(res.length).to.equal(2)
      done()
    })
  })

  it.skip('disconnect', (done) => {})

  it.skip('stop', (done) => {
    ipfsA.goOffline((err) => {
      expect(err).to.not.exist
      ipfsB.goOffline(done)
    })
  })
})
