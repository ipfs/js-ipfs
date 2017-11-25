/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

module.exports = (common) => {
  describe('.config', function () {
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

    describe('.get', () => {
      it('retrieve the whole config', (done) => {
        ipfs.config.get((err, config) => {
          expect(err).to.not.exist()
          expect(config).to.exist()
          done()
        })
      })

      it('retrieve a value through a key', (done) => {
        ipfs.config.get('Identity.PeerID', (err, peerId) => {
          expect(err).to.not.exist()
          expect(peerId).to.exist()
          done()
        })
      })

      it('retrieve a value through a nested key', (done) => {
        ipfs.config.get('Addresses.Swarm', (err, swarmAddrs) => {
          expect(err).to.not.exist()
          expect(swarmAddrs).to.exist()
          done()
        })
      })

      it('fail on non valid key', (done) => {
        ipfs.config.get(1234, (err, peerId) => {
          expect(err).to.exist()
          done()
        })
      })

      it('fail on non exist()ent key', (done) => {
        ipfs.config.get('Bananas', (err, peerId) => {
          expect(err).to.exist()
          done()
        })
      })

      it('Promises support', () => {
        return ipfs.config.get()
          .then((config) => {
            expect(config).to.exist()
          })
      })
    })

    describe('.set', () => {
      it('set a new key', (done) => {
        ipfs.config.set('Fruit', 'banana', (err) => {
          expect(err).to.not.exist()
          ipfs.config.get('Fruit', (err, fruit) => {
            expect(err).to.not.exist()
            expect(fruit).to.equal('banana')
            done()
          })
        })
      })

      it('set an already exist()ing key', (done) => {
        ipfs.config.set('Fruit', 'morango', (err) => {
          expect(err).to.not.exist()
          ipfs.config.get('Fruit', (err, fruit) => {
            expect(err).to.not.exist()
            expect(fruit).to.equal('morango')
            done()
          })
        })
      })

      it('set a JSON object', (done) => {
        const key = 'API.HTTPHeaders.Access-Control-Allow-Origin'
        const val = ['http://example.io']
        ipfs.config.set(key, val, function (err) {
          expect(err).to.not.exist()
          ipfs.config.get(key, function (err, result) {
            expect(err).to.not.exist()
            expect(result).to.deep.equal(val)
            done()
          })
        })
      })

      it('fail on non valid key', (done) => {
        ipfs.config.set(Buffer.from('heeey'), '', (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('fail on non valid value', (done) => {
        ipfs.config.set('Fruit', Buffer.from('abc'), (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('Promises support', () => {
        return ipfs.config.set('Fruit', 'banana')
          .then(() => ipfs.config.get('Fruit'))
          .then((fruit) => {
            expect(fruit).to.equal('banana')
          })
      })
    })

    // Waiting for fix on go-ipfs
    // - https://github.com/ipfs/js-ipfs-api/pull/307#discussion_r69281789
    // - https://github.com/ipfs/go-ipfs/issues/2927
    describe.skip('.replace', () => {
      const config = {
        Fruit: 'Bananas'
      }

      it('replace the whole config', (done) => {
        ipfs.config.replace(config, (err) => {
          expect(err).to.not.exist()
          ipfs.config.get((err, _config) => {
            expect(err).to.not.exist()
            expect(_config).to.deep.equal(config)
          })
        })
      })

      it('replace to empty config', (done) => {
        ipfs.config.replace({}, (err) => {
          expect(err).to.not.exist()
          ipfs.config.get((err, _config) => {
            expect(err).to.not.exist()
            expect(_config).to.deep.equal(config)
          })
        })
      })
    })
  })
}
