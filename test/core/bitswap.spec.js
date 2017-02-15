/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const _ = require('lodash')
const series = require('async/series')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const map = require('async/map')
const leftPad = require('left-pad')
const Block = require('ipfs-block')
const mh = require('multihashes')
const bl = require('bl')
const API = require('ipfs-api')
const multiaddr = require('multiaddr')
const isNode = require('detect-node')

// This gets replaced by '../utils/create-repo-browser.js' in the browser
const createTempRepo = require('../utils/create-repo-node.js')

const IPFS = require('../../src/core')

function makeBlock (cb) {
  return cb(null, new Block(`IPFS is awesome ${Math.random()}`))
}

describe('bitswap', () => {
  let inProcNode // Node spawned inside this process
  let swarmAddrsBak

  beforeEach((done) => {
    const repo = createTempRepo()
    inProcNode = new IPFS({
      repo: repo,
      EXPERIMENTAL: {
        pubsub: true
      }
    })
    series([
      (cb) => inProcNode.init({ bits: 2048 }, cb),
      (cb) => {
        if (!isNode) {
          inProcNode.config.get('Addresses.Swarm', (err, swarmAddrs) => {
            expect(err).to.not.exist
            swarmAddrsBak = swarmAddrs
            inProcNode.config.set('Addresses.Swarm', [], cb)
          })
        } else {
          cb()
        }
      },
      (cb) => inProcNode.config.set('Discovery.MDNS.Enabled', false, cb),
      (cb) => inProcNode.load(cb)
    ], done)
  })

  afterEach((done) => {
    if (!isNode) {
      inProcNode.config.set('Addresses.Swarm', swarmAddrsBak, done)
    } else {
      done()
    }
  })

  describe('connections', () => {
    function wire (targetNode, dialerNode, done) {
      targetNode.id((err, identity) => {
        expect(err).to.not.exist
        const addr = identity.addresses
          .map((addr) => {
            const ma = multiaddr(addr.toString().split('ipfs')[0])
            return ma
          })
          .filter((addr) => {
            return _.includes(addr.protoNames(), 'ws')
          })[0]

        let targetAddr
        if (addr) {
          targetAddr = addr.encapsulate(multiaddr(`/ipfs/${identity.id}`)).toString()
          targetAddr = targetAddr.replace('0.0.0.0', '127.0.0.1')
        } else {
          // Note: the browser doesn't have a websockets listening addr

          // What we really need is a way to dial to a peerId only and another
          // to dial to peerInfo
          return done()
          // targetAddr = multiaddr(`/ip4/127.0.0.1/tcp/0/ws/ipfs/${identity.id}`).toString()
        }

        dialerNode.swarm.connect(targetAddr, done)
      })
    }

    function connectNodes (remoteNode, ipn, done) {
      series([
        (cb) => {
          wire(remoteNode, ipn, cb)
        },
        (cb) => setTimeout(() => {
          // need timeout so we wait for identify
          // to happen.

          // This call is just to ensure identify happened
          wire(ipn, remoteNode, cb)
        }, 300)
      ], done)
    }

    function addNode (num, done) {
      num = leftPad(num, 3, 0)

      const apiUrl = `/ip4/127.0.0.1/tcp/31${num}`
      const remoteNode = new API(apiUrl)

      connectNodes(remoteNode, inProcNode, (err) => {
        done(err, remoteNode)
      })
    }

    describe('fetches a remote block', () => {
      beforeEach((done) => {
        inProcNode.goOnline(done)
      })

      afterEach((done) => {
        setTimeout(() => inProcNode.goOffline(done), 1500)
      })

      it('2 peers', (done) => {
        let remoteNode
        let block
        waterfall([
          (cb) => parallel([
            (cb) => makeBlock(cb),
            (cb) => addNode(13, cb)
          ], cb),
          (res, cb) => {
            block = res[0]
            remoteNode = res[1]
            cb()
          },
          (cb) => remoteNode.block.put(block, cb),
          (res, cb) => block.key('sha2-256', cb),
          (key, cb) => inProcNode.block.get(key, cb),
          (b, cb) => {
            expect(b.data).to.be.eql(block.data)
            cb()
          }
        ], done)
      })

      it('3 peers', function (done) {
        this.timeout(60 * 1000)

        let blocks
        let keys
        const remoteNodes = []

        series([
          (cb) => parallel(_.range(6).map((i) => makeBlock), (err, _blocks) => {
            expect(err).to.not.exist
            blocks = _blocks
            map(blocks, (b, cb) => b.key('sha2-256', cb), (err, res) => {
              expect(err).to.not.exist
              keys = res
              cb()
            })
          }),
          (cb) => addNode(8, (err, _ipfs) => {
            remoteNodes.push(_ipfs)
            cb(err)
          }),
          (cb) => addNode(7, (err, _ipfs) => {
            remoteNodes.push(_ipfs)
            cb(err)
          }),
          (cb) => connectNodes(remoteNodes[0], remoteNodes[1], cb),
          (cb) => remoteNodes[0].block.put(blocks[0], cb),
          (cb) => remoteNodes[0].block.put(blocks[1], cb),
          (cb) => remoteNodes[1].block.put(blocks[2], cb),
          (cb) => remoteNodes[1].block.put(blocks[3], cb),
          (cb) => inProcNode.block.put(blocks[4], cb),
          (cb) => inProcNode.block.put(blocks[5], cb),
          // 3. Fetch blocks on all nodes
          (cb) => parallel(_.range(6).map((i) => (cbI) => {
            const check = (n, k, callback) => {
              n.block.get(k, (err, b) => {
                expect(err).to.not.exist
                expect(
                  (b.data || b).toString()
                ).to.be.eql(
                  blocks[i].data.toString()
                )
                callback()
              })
            }

            series([
              (cbJ) => check(remoteNodes[0], mh.toB58String(keys[i]), cbJ),
              (cbJ) => check(remoteNodes[1], mh.toB58String(keys[i]), cbJ),
              (cbJ) => check(inProcNode, keys[i], cbJ)
            ], cbI)
          }), cb)
        ], done)
      })
    })

    describe('fetches a remote file', () => {
      beforeEach((done) => {
        inProcNode.goOnline(done)
      })

      afterEach((done) => {
        setTimeout(() => inProcNode.goOffline(done), 1500)
      })

      it('2 peers', (done) => {
        const file = new Buffer(`I love IPFS <3 ${Math.random()}`)

        waterfall([
          // 0. Start node
          (cb) => addNode(12, cb),
          // 1. Add file to tmp instance
          (remote, cb) => {
            remote.files.add([{
              path: 'awesome.txt',
              content: file
            }], cb)
          },
          // 2. Request file from local instance
          (val, cb) => {
            inProcNode.files.cat(val[0].hash, cb)
          },
          (res, cb) => res.pipe(bl(cb))
        ], (err, res) => {
          expect(err).to.not.exist
          expect(res).to.be.eql(file)
          done()
        })
      })
    })
  })

  describe('bitswap API', () => {
    describe('wantlist', (done) => {
      it('throws if offline', () => {
        expect(
          () => inProcNode.bitswap.wantlist()
        ).to.throw(/online/)
      })

      it('returns an array of wanted blocks', (done) => {
        inProcNode.goOnline((err) => {
          expect(err).to.not.exist
          expect(inProcNode.bitswap.wantlist())
            .to.be.eql([])
          inProcNode.goOffline(done)
        })
      })

      describe('stat', () => {
        it('throws while offline', () => {
          expect(
            () => inProcNode.bitswap.stat()
          ).to.throw(/online/)
        })

        it('returns the stats', (done) => {
          inProcNode.goOnline((err) => {
            expect(err).to.not.exist

            let stats = inProcNode.bitswap.stat()

            expect(stats).to.have.keys([
              'blocksReceived',
              'wantlist',
              'peers',
              'dupDataReceived',
              'dupBlksReceived'
            ])

            inProcNode.goOffline(done)
          })
        })
      })

      describe('unwant', () => {
        it('throws if offline', () => {
          expect(
            () => inProcNode.bitswap.unwant('my key')
          ).to.throw(/online/)
        })
      })
    })
  })
})
