/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

module.exports = (common) => {
  describe('.dht', () => {
    let ipfs
    let peers

    before((done) => {
      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => {
      common.teardown(done)
    })

    describe('callback API', () => {
      it('.get errors when getting a non-exist()ent key from the DHT', (done) => {
        ipfs.dht.get('non-exist()ing', {timeout: '100ms'}, (err, value) => {
          expect(err).to.be.an.instanceof(Error)
          done()
        })
      })
      it('.findprovs', (done) => {
        ipfs.dht.findprovs('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
          expect(err).to.not.exist()

          expect(res).to.be.an('array')
          done()
        })
      })
    })
    describe('promise API', () => {
      it('.get errors when getting a non-exist()ent key from the DHT', (done) => {
        ipfs.dht.get('non-exist()ing', {timeout: '100ms'}).catch((err) => {
          expect(err).to.be.an.instanceof(Error)
          done()
        })
      })
      it('.findprovs', (done) => {
        ipfs.dht.findprovs('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP').then((res) => {
          expect(res).to.be.an('array')
          done()
        }).catch(done)
      })
    })
    // Tests below are tests that haven't been implemented yet or is not
    // passing currently
    xdescribe('.findpeer', () => {
      it('finds other peers', (done) => {
        peers.a.ipfs.dht.findpeer(peers.b.peerID, (err, foundPeer) => {
          expect(err).to.be.empty()
          expect(foundPeer.peerID).to.be.equal(peers.b.peerID)
          done()
        })
      })
      it('fails to find other peer, if peer doesnt exist()s', (done) => {
        peers.a.ipfs.dht.findpeer('ARandomPeerID', (err, foundPeer) => {
          expect(err).to.be.instanceof(Error)
          expect(foundPeer).to.be.equal(null)
          done()
        })
      })
    })
    xit('.put and .get a key value pair in the DHT', (done) => {
      peers.a.ipfs.dht.put('scope', 'interplanetary', (err, res) => {
        expect(err).to.not.exist()

        expect(res).to.be.an('array')

        // bug: https://github.com/ipfs/go-ipfs/issues/1923#issuecomment-152932234
        peers.b.ipfs.dht.get('scope', (err, value) => {
          expect(err).to.not.exist()
          expect(value).to.be.equal('interplanetary')
          done()
        })
      })
    })
    xdescribe('.query', () => {})
  })
}
