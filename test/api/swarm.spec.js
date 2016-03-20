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

  describe('promise', () => {
    it('.swarm.peers', () => {
      return apiClients.a.swarm.peers()
        .then((res) => {
          expect(res.Strings).to.have.length.above(1)
        })
    })
  })
})
