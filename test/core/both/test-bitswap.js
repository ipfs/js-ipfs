/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const _ = require('lodash')
const series = require('async/series')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const leftPad = require('left-pad')
const Block = require('ipfs-block')
const bs58 = require('bs58')
const bl = require('bl')
const API = require('ipfs-api')
const multiaddr = require('multiaddr')
const isNode = require('detect-node')
const IPFS = require('../../../src/core')

function makeBlock () {
  return new Block(`IPFS is awesome ${Math.random()}`)
}

describe.skip('bitswap', () => {
  let inProcNode // Node spawned inside this process
  let swarmAddrsBak

  beforeEach((done) => {
    inProcNode = new IPFS(require('../../utils/repo-path'))
    if (!isNode) {
      inProcNode.config.get('Addresses.Swarm', (err, swarmAddrs) => {
        expect(err).to.not.exist
        swarmAddrsBak = swarmAddrs
        inProcNode.config.set('Addresses.Swarm', [], (err) => {
          expect(err).to.not.exist
          inProcNode.load(done)
        })
      })
    } else {
      inProcNode.load(done)
    }
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
          // Note: the browser doesn't have
          // a websockets listening addr

          // TODO, what we really need is a way to dial to
          // a peerId only and another to dial to peerInfo
          targetAddr = multiaddr(`/ip4/127.0.0.1/tcp/0/ws/ipfs/${identity.id}`).toString()
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
        const block = makeBlock()
        let remoteNode
        series([
          // 0. Start node
          (cb) => addNode(13, (err, _remoteNode) => {
            expect(err).to.not.exist
            remoteNode = _remoteNode
            cb(err)
          }),
          (cb) => {
            remoteNode.block.put(block, cb)
          },
          (cb) => {
            inProcNode.block.get(block.key('sha2-256'), (err, b) => {
              expect(b.data.toString()).to.be.eql(block.data.toString())
              cb(err)
            })
          }
        ], done)
      })

      it('3 peers', function (done) {
        this.timeout(60 * 1000)

        const blocks = _.range(6).map((i) => makeBlock())
        const keys = blocks.map((b) => b.key('sha2-256'))
        const remoteNodes = []
        series([
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
            const toMh = (k) => bs58.encode(k).toString()
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
              (cbJ) => check(remoteNodes[0], toMh(keys[i]), cbJ),
              (cbJ) => check(remoteNodes[1], toMh(keys[i]), cbJ),
              (cbJ) => check(inProcNode, keys[i], cbJ)
            ], cbI)
          }), cb)
        ], done)
      })
    })

    // wont work without http-api for add
    describe.skip('fetches a remote file', () => {
      beforeEach((done) => {
        inProcNode.goOnline(done)
      })

      it('2 peers', (done) => {
        const file = new Buffer('I love IPFS <3')

        let node
        waterfall([
          // 0. Start node
          (cb) => addNode(9, (err, _ipfs) => {
            node = _ipfs
            cb(err)
          }),
          // 1. Add file to tmp instance
          (cb) => node.add([{path: 'awesome.txt', content: file}], cb),
          // 2. Request file from local instance
          (val, cb) => {
            const hash = bs58.encode(val[0].multihash).toString()

            inProcNode.files.cat(hash, (err, res) => {
              expect(err).to.not.exist
              res.on('file', (data) => {
                data.content.pipe(bl((err, bldata) => {
                  expect(err).to.not.exist
                  expect(bldata.toString()).to.equal('I love IPFS <3')
                  cb()
                }))
              })
            })
          },
          (cb) => setTimeout(() => node.goOffline(cb), 1000)
        ], done)
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

          expect(
            inProcNode.bitswap.wantlist()
          ).to.be.eql(
            []
          )

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
