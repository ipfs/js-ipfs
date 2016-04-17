/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect

describe('.swarm', () => {
  it('.swarm.peers', (done) => {
    apiClients.a.swarm.peers((err, res) => {
      expect(err).to.not.exist

      expect(res.Strings).to.have.length.above(1)
      done()
    })
  })

  it('.swarm.connect', (done) => {
    // Done in the 'before' segment
    done()
  })

  it('.swarm.disconnect', (done) => {
    // Done in the 'after' segment
    done()
  })

  it('.swarm.addrs', (done) => {
    apiClients['a'].swarm.addrs((err, res) => {
      expect(err).to.not.exist

      expect(Object.keys(res.Addrs)).to.have.length.above(1)
      done()
    })
  })

  it('.swarm.localAddrs', (done) => {
    apiClients['a'].swarm.localAddrs((err, res) => {
      expect(err).to.not.exist

      expect(res.Strings).to.have.length.above(1)
      done()
    })
  })

  describe('promise', () => {
    it('.swarm.peers', () => {
      return apiClients.a.swarm.peers()
        .then((res) => {
          expect(res.Strings).to.have.length.above(1)
        })
    })

    it('.swarm.addrs', () => {
      return apiClients['a'].swarm.addrs()
        .then((res) => {
          expect(Object.keys(res.Addrs)).to.have.length.above(1)
        })
    })

    it('.swarm.localAddrs', () => {
      return apiClients['a'].swarm.localAddrs()
        .then((res) => {
          expect(res.Strings).to.have.length.above(1)
        })
    })
  })
})
