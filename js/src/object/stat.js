/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const bs58 = require('bs58')
const series = require('async/series')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.stat', function () {
    this.timeout(80 * 1000)

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

    it('should get stats by multihash', (done) => {
      const testObj = {
        Data: Buffer.from('get test object'),
        Links: []
      }

      ipfs.object.put(testObj, (err, node) => {
        expect(err).to.not.exist()

        ipfs.object.stat(node.multihash, (err, stats) => {
          expect(err).to.not.exist()
          const expected = {
            Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
            NumLinks: 0,
            BlockSize: 17,
            LinksSize: 2,
            DataSize: 15,
            CumulativeSize: 17
          }
          expect(expected).to.deep.equal(stats)
          done()
        })
      })
    })

    it('should get stats for object by multihash (promised)', () => {
      const testObj = {
        Data: Buffer.from('get test object'),
        Links: []
      }

      return ipfs.object.put(testObj, (err, node) => {
        expect(err).to.not.exist()

        return ipfs.object.stat('QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ', {enc: 'base58'})
          .then((stats) => {
            const expected = {
              Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
              NumLinks: 0,
              BlockSize: 17,
              LinksSize: 2,
              DataSize: 15,
              CumulativeSize: 17
            }
            expect(expected).to.deep.equal(stats)
          })
      })
    })

    it('should get stats for object with links by multihash', (done) => {
      let node1a
      let node1b
      let node2

      series([
        (cb) => {
          DAGNode.create(Buffer.from('Some data 1'), (err, node) => {
            expect(err).to.not.exist()
            node1a = node
            cb()
          })
        },
        (cb) => {
          DAGNode.create(Buffer.from('Some data 2'), (err, node) => {
            expect(err).to.not.exist()
            node2 = node
            cb()
          })
        },
        (cb) => {
          const link = node2.toJSON()
          link.name = 'some-link'

          DAGNode.addLink(node1a, link, (err, node) => {
            expect(err).to.not.exist()
            node1b = node
            cb()
          })
        },
        (cb) => {
          ipfs.object.put(node1b, cb)
        },
        (cb) => {
          ipfs.object.stat(node1b.multihash, (err, stats) => {
            expect(err).to.not.exist()
            const expected = {
              Hash: 'QmPR7W4kaADkAo4GKEVVPQN81EDUFCHJtqejQZ5dEG7pBC',
              NumLinks: 1,
              BlockSize: 64,
              LinksSize: 53,
              DataSize: 11,
              CumulativeSize: 77
            }
            expect(expected).to.eql(stats)
            cb()
          })
        }
      ], done)
    })

    it('should get stats by base58 encoded multihash', (done) => {
      const testObj = {
        Data: Buffer.from('get test object'),
        Links: []
      }

      ipfs.object.put(testObj, (err, node) => {
        expect(err).to.not.exist()

        ipfs.object.stat(bs58.encode(node.multihash), { enc: 'base58' }, (err, stats) => {
          expect(err).to.not.exist()
          const expected = {
            Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
            NumLinks: 0,
            BlockSize: 17,
            LinksSize: 2,
            DataSize: 15,
            CumulativeSize: 17
          }
          expect(expected).to.deep.equal(stats)
          done()
        })
      })
    })

    it('should get stats by base58 encoded multihash string', (done) => {
      const testObj = {
        Data: Buffer.from('get test object'),
        Links: []
      }

      ipfs.object.put(testObj, (err, node) => {
        expect(err).to.not.exist()

        ipfs.object.stat(bs58.encode(node.multihash).toString(), { enc: 'base58' }, (err, stats) => {
          expect(err).to.not.exist()
          const expected = {
            Hash: 'QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ',
            NumLinks: 0,
            BlockSize: 17,
            LinksSize: 2,
            DataSize: 15,
            CumulativeSize: 17
          }
          expect(expected).to.deep.equal(stats)
          done()
        })
      })
    })
  })
}
