/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.config.get', function () {
    this.timeout(30 * 1000)
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    it('should retrieve the whole config', (done) => {
      ipfs.config.get((err, config) => {
        expect(err).to.not.exist()
        expect(config).to.exist()
        done()
      })
    })

    it('should retrieve the whole config (promised)', () => {
      return ipfs.config.get()
        .then((config) => {
          expect(config).to.exist()
        })
    })

    it('should retrieve a value through a key', (done) => {
      ipfs.config.get('Identity.PeerID', (err, peerId) => {
        expect(err).to.not.exist()
        expect(peerId).to.exist()
        done()
      })
    })

    it('should retrieve a value through a nested key', (done) => {
      ipfs.config.get('Addresses.Swarm', (err, swarmAddrs) => {
        expect(err).to.not.exist()
        expect(swarmAddrs).to.exist()
        done()
      })
    })

    it('should fail on non valid key', (done) => {
      ipfs.config.get(1234, (err, peerId) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should fail on non existent key', (done) => {
      ipfs.config.get('Bananas', (err, peerId) => {
        expect(err).to.exist()
        done()
      })
    })
  })
}
