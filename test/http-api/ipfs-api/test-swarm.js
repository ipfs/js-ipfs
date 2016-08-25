/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const createTempNode = require('./../../utils/temp-node')

module.exports = (ctl) => {
  describe('.swarm', () => {
    let remoteNode
    let remoteNodeAddr

    before((done) => {
      createTempNode(6, (err, _remoteNode) => {
        expect(err).to.not.exist
        remoteNode = _remoteNode
        remoteNode.goOnline(() => {
          remoteNode.id((err, res) => {
            expect(err).to.not.exist
            remoteNodeAddr = `${res.addresses[0]}/ipfs/${res.id}`
            done()
          })
        })
      })
    })

    after((done) => {
      setTimeout(() => {
        remoteNode.goOffline(done)
      }, 1000)
    })

    it('.connect returns error for request without argument', (done) => {
      ctl.swarm.connect(null, (err, result) => {
        expect(err).to.exist
        done()
      })
    })

    it('.connect returns error for request with invalid argument', (done) => {
      ctl.swarm.connect('invalid', (err, result) => {
        expect(err).to.exist
        done()
      })
    })

    it('.connect', (done) => {
      ctl.swarm.connect(remoteNodeAddr, (err, result) => {
        expect(err).to.not.exist
        done()
      })
    })

    it('.peers', (done) => {
      ctl.swarm.peers((err, multiaddrs) => {
        expect(err).to.not.exist
        expect(multiaddrs).to.have.length.above(0)
        done()
      })
    })

    it('.localAddrs', (done) => {
      ctl.swarm.localAddrs((err, multiaddrs) => {
        expect(err).to.not.exist
        expect(multiaddrs).to.have.length.above(0)
        done()
      })
    })
  })
}
