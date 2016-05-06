/* eslint-env mocha */
'use strict'

const async = require('async')
const expect = require('chai').expect
const Block = require('ipfs-block')
const base58 = require('bs58')
const createTempNode = require('../utils/temp-node')

module.exports = (httpAPI) => {
  describe('bitswap', function () {
    this.timeout(20000)

    describe('api', () => {
      let api
      let ipfs // tmp node
      let ipfsAddr

      before((done) => {
        async.series([
          (cb) => {
            createTempNode(6, (err, _ipfs) => {
              expect(err).to.not.exist
              ipfs = _ipfs
              ipfs.goOnline(cb)
            })
          },
          (cb) => {
            ipfs.id((err, res) => {
              expect(err).to.not.exist
              ipfsAddr = `${res.Addresses[0]}/ipfs/${res.ID}`
              api = httpAPI.server.select('API')
              api.inject({
                method: 'GET',
                url: `/api/v0/swarm/connect?arg=${ipfsAddr}`
              }, (res) => {
                expect(res.statusCode).to.equal(200)
                cb()
              })
            })
          },
          (cb) => {
            api.inject({
              method: 'GET',
              url: '/api/v0/id'
            }, (res) => {
              expect(res.statusCode).to.equal(200)
              const result = res.result

              ipfs.libp2p.swarm.connect(`${result.Addresses[0]}/ipfs/${result.ID}`, cb)
            })
          }
        ], done)
      })

      after((done) => {
        // cause CI takes forever
        var closed = false
        setTimeout(() => {
          if (!closed) {
            closed = true
            done()
          }
        }, 10000)
        ipfs.goOffline(() => {
          if (!closed) {
            closed = true
            done()
          }
        })
      })

      it('fetches a remote file', (done) => {
        const block = new Block('I am awesome')
        async.series([
          // 1. Add file to tmp instance
          (cb) => ipfs.block.put(block, cb),
          // 2. Request file from local instance
          (cb) => {
            const mh = base58.encode(block.key)
            api.inject({
              method: 'GET',
              url: `/api/v0/block/get?arg=${mh}`
            }, (res) => {
              expect(res.statusCode).to.equal(200)
              // 3. Profit
              expect(res.result).to.be.eql('I am awesome')
              cb()
            })
          }
        ], done)
      })

      describe('commands', () => {
        it('wantlist', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/bitswap/wantlist'
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result).to.have.property('Keys')

            // TODO test that there actual values in there
            done()
          })
        })

        it('stat', (done) => {
          api.inject({
            method: 'GET',
            url: '/api/v0/bitswap/stat'
          }, (res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result).to.have.property('Wantlist')
            expect(res.result).to.have.property('Peers')
            expect(res.result).to.have.property('DupBlksReceived', 0)
            expect(res.result).to.have.property('DupDataReceived', 0)

            // TODO test that there actual values in there
            done()
          })
        })

        it.skip('unwant', () => {
        })
      })
    })
  })
}
