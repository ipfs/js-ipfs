/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const _ = require('lodash')
const async = require('async')
const Block = require('ipfs-block')

const IPFS = require('../../src/core')
const createTempNode = require('../utils/temp-node')

describe('bitswap', () => {
  let ipfs

  beforeEach((done) => {
    ipfs = new IPFS(require('./repo-path'))
    ipfs.load(done)
  })

  describe('connections', () => {
    function getAndAssertBlock (node, key, block, cb) {
      node.block.get(key, (err, b) => {
        expect(err).to.not.exist
        expect(b.data.toString()).to.be.eql(block.data.toString())
        cb()
      })
    }

    function connectNodesSingle (node1, node2, done) {
      node1.id((err, res) => {
        expect(err).to.not.exist
        node2.libp2p.swarm.connect(`${res.Addresses[0]}/ipfs/${res.ID}`, done)
      })
    }

    function connectNodes (node1, node2, done) {
      async.parallel([
        (cb) => connectNodesSingle(node1, node2, cb),
        (cb) => connectNodesSingle(node2, node1, cb)
      ], done)
    }

    function addNode (num, done) {
      let node
      async.waterfall([
        (cb) => {
          createTempNode(num, (err, _ipfs) => {
            expect(err).to.not.exist
            node = _ipfs
            cb()
          })
        },
        (cb) => node.goOnline(cb),
        (cb) => connectNodes(node, ipfs, cb)
      ], (err) => {
        done(err, node)
      })
    }

    describe('fetches a remote block', () => {
      beforeEach((done) => {
        ipfs.goOnline(done)
      })

      it('2 peers', (done) => {
        const block = new Block('I am awesome, 2')
        let node
        async.series([
          // 0. Start node
          (cb) => addNode(6, (err, _ipfs) => {
            node = _ipfs
            cb(err)
          }),
          // 1. Add file to tmp instance
          (cb) => node.block.put(block, cb),
          // 2. Request file from local instance
          (cb) => {
            ipfs.block.get(block.key, (err, b) => {
              expect(err).to.not.exist
              // 3. Profit
              expect(b.data.toString()).to.be.eql('I am awesome, 2')
              cb()
            })
          },
          (cb) => node.goOffline(cb)
        ], done)
      })

      it('3 peers', function (done) {
        this.timeout(60 * 1000)

        const blocks = _.range(6).map((i) => new Block(`I am awesome, ${i}`))
        const keys = blocks.map((b) => b.key)
        const nodes = []
        async.series([
          // 0. Start node 1
          (cb) => addNode(6, (err, _ipfs) => {
            nodes.push(_ipfs)
            cb(err)
          }),
          // 1. Start node 2
          (cb) => addNode(7, (err, _ipfs) => {
            nodes.push(_ipfs)
            cb(err)
          }),
          (cb) => connectNodes(nodes[0], nodes[1], cb),
          // 2. Put blocks on all nodes
          (cb) => nodes[0].block.put(blocks[0], cb),
          (cb) => nodes[0].block.put(blocks[1], cb),
          (cb) => nodes[1].block.put(blocks[2], cb),
          (cb) => nodes[1].block.put(blocks[3], cb),
          (cb) => ipfs.block.put(blocks[4], cb),
          (cb) => ipfs.block.put(blocks[5], cb),
          // 3. Fetch blocks on all nodes
          (cb) => async.parallel([
            (cb) => {
              async.each(_.range(6), (i, innerCb) => {
                getAndAssertBlock(nodes[0], keys[i], blocks[i], innerCb)
              }, cb)
            },
            (cb) => {
              async.each(_.range(6), (i, innerCb) => {
                getAndAssertBlock(nodes[1], keys[i], blocks[i], innerCb)
              }, cb)
            },
            (cb) => {
              async.each(_.range(6), (i, innerCb) => {
                getAndAssertBlock(ipfs, keys[i], blocks[i], innerCb)
              }, cb)
            }
          ], cb),
          // 4. go offline
          (cb) => setTimeout(() => {
            // need to wait a bit to let the sockets finish handshakes
            async.parallel([
              (cb) => nodes[0].goOffline(cb),
              (cb) => nodes[1].goOffline(cb)
            ], cb)
          }, 500)
        ], done)
      })
    })
  })

  describe('commands', () => {
    describe('wantlist', (done) => {
      it('throws if offline', () => {
        expect(
          () => ipfs.bitswap.wantlist()
        ).to.throw(/online/)
      })

      it('returns an array of wanted blocks', (done) => {
        ipfs.goOnline((err) => {
          expect(err).to.not.exist

          expect(
            ipfs.bitswap.wantlist()
          ).to.be.eql(
            []
          )

          done()
        })
      })

      describe('stat', () => {
        it('throws if offline', () => {
          expect(
            () => ipfs.bitswap.stat()
          ).to.throw(/online/)
        })

        it('returns the stats', (done) => {
          ipfs.goOnline((err) => {
            expect(err).to.not.exist

            let stats = ipfs.bitswap.stat()

            expect(stats).to.have.keys([
              'blocksReceived',
              'wantlist',
              'peers',
              'dupDataReceived',
              'dupBlksReceived'
            ])
            done()
          })
        })
      })

      describe('unwant', () => {
        it('throws if offline', () => {
          expect(
            () => ipfs.bitswap.unwant('my key')
          ).to.throw(/online/)
        })
      })
    })
  })
})
