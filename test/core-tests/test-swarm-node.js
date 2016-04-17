/* eslint-env mocha */

const expect = require('chai').expect

const createTempNode = require('../utils/temp-node')

describe('swarm', function () {
  this.timeout(20000)

  var ipfsA
  var ipfsB
  var ipfsAAddr

  before((done) => {
    createTempNode(3, (err, ipfs) => {
      expect(err).to.not.exist
      ipfsA = ipfs

      createTempNode(4, (err, ipfs) => {
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
    ipfsA.libp2p.start((err) => {
      expect(err).to.not.exist
      ipfsB.libp2p.start((err) => {
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
      expect(res).to.have.length.above(1)
      done()
    })
  })

  it.skip('disconnect', (done) => {})

  it.skip('stop', (done) => {
    ipfsA.libp2p.stop((err) => {
      expect(err).to.not.exist
      done()
    })
  })
})
