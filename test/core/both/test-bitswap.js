/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const _ = require('lodash')
const series = require('run-series')
const waterfall = require('run-waterfall')
const parallel = require('run-parallel')
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

describe('bitswap', () => {
  let ipfs
  let configBak

  beforeEach((done) => {
    ipfs = new IPFS(require('../../utils/repo-path'))
    if (!isNode) {
      ipfs.config.show((err, config) => {
        configBak = JSON.parse(JSON.stringify(config))
        expect(err).to.not.exist
        config.Addresses.Swarm = []
        ipfs.config.replace(config, (err) => {
          expect(err).to.not.exist
          ipfs.load(done)
        })
      })
    } else {
      ipfs.load(done)
    }
  })

  afterEach((done) => {
    if (!isNode) {
      ipfs.config.replace(configBak, done)
    } else {
      done()
    }
  })

  describe('connections', () => {
    function connectNodesSingle (node1, node2, done) {
      node1.id((err, res) => {
        expect(err).to.not.exist
        const addr = res.Addresses
                .map((addr) => multiaddr(addr))
                .filter((addr) => {
                  return _.includes(addr.protoNames(), 'ws')
                })[0]

        let target
        if (addr) {
          target = addr.encapsulate(multiaddr(`/ipfs/${res.ID}`)).toString()
          target = target.replace('0.0.0.0', '127.0.0.1')
        } else {
          // cause browser nodes don't have a websockets addrs
          // TODO, what we really need is a way to dial to a peerId only
          // and another to dial to peerInfo
          target = multiaddr(`/ip4/0.0.0.0/tcp/0/ws/ipfs/${res.ID}`).toString()
        }

        const swarm = node2.libp2p ? node2.libp2p.swarm : node2.swarm
        swarm.connect(target, done)
      })
    }

    function connectNodes (node1, node2, done) {
      series([
        (cb) => connectNodesSingle(node1, node2, cb),
        (cb) => setTimeout(() => {
          // need timeout so we wait for identify to happen
          // in the browsers
          connectNodesSingle(node2, node1, cb)
        }, 100)
      ], done)
    }

    function addNode (num, done) {
      num = leftPad(num, 3, 0)
      const apiUrl = `/ip4/127.0.0.1/tcp/31${num}`
      const node = new API(apiUrl)

      connectNodes(node, ipfs, (err) => {
        done(err, node)
      })
    }

    describe('fetches a remote block', () => {
      beforeEach((done) => {
        ipfs.goOnline(done)
      })

      afterEach((done) => {
        // ipfs.goOffline(done)
        setTimeout(() => ipfs.goOffline(done), 1500)
      })

      it('2 peers', (done) => {
        const block = makeBlock()
        let node
        series([
          // 0. Start node
          (cb) => addNode(9, (err, _ipfs) => {
            node = _ipfs
            cb(err)
          }),
          (cb) => node.block.put(block.data, cb),
          (cb) => {
            ipfs.block.get(block.key, (err, b) => {
              expect(err).to.not.exist
              expect(b.data.toString()).to.be.eql(block.data.toString())
              cb()
            })
          }
        ], done)
      })

      it('3 peers', function (done) {
        this.timeout(60 * 1000)

        const blocks = _.range(6).map((i) => makeBlock())
        const keys = blocks.map((b) => b.key)
        const nodes = []
        series([
          (cb) => addNode(8, (err, _ipfs) => {
            nodes.push(_ipfs)
            cb(err)
          }),
          (cb) => addNode(7, (err, _ipfs) => {
            nodes.push(_ipfs)
            cb(err)
          }),
          (cb) => connectNodes(nodes[0], nodes[1], cb),
          (cb) => nodes[0].block.put(blocks[0].data, cb),
          (cb) => nodes[0].block.put(blocks[1].data, cb),
          (cb) => nodes[1].block.put(blocks[2].data, cb),
          (cb) => nodes[1].block.put(blocks[3].data, cb),
          (cb) => ipfs.block.put(blocks[4], cb),
          (cb) => ipfs.block.put(blocks[5], cb),
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
              (cbJ) => check(nodes[0], toMh(keys[i]), cbJ),
              (cbJ) => check(nodes[1], toMh(keys[i]), cbJ),
              (cbJ) => check(ipfs, keys[i], cbJ)
            ], cbI)
          }), cb)
        ], done)
      })
    })

    // wont work without http-api for add
    describe.skip('fetches a remote file', () => {
      beforeEach((done) => {
        ipfs.goOnline(done)
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

            ipfs.files.cat(hash, (err, res) => {
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

          ipfs.goOffline(done)
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

            ipfs.goOffline(done)
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
