/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const series = require('async/series')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { asDAGLink } = require('./utils')

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

      ipfs.object.put(testObj, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.stat(cid, (err, stats) => {
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

    it('should get stats for object by multihash (promised)', async () => {
      const testObj = {
        Data: Buffer.from('get test object'),
        Links: []
      }

      await ipfs.object.put(testObj)
      const stats = await ipfs.object.stat('QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ', { enc: 'base58' })

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

    it('should get stats for object with links by multihash', (done) => {
      let node1a
      let node1b
      let node1bCid
      let node2

      series([
        (cb) => {
          try {
            node1a = DAGNode.create(Buffer.from('Some data 1'))
          } catch (err) {
            return cb(err)
          }

          cb()
        },
        (cb) => {
          try {
            node2 = DAGNode.create(Buffer.from('Some data 2'))
          } catch (err) {
            return cb(err)
          }

          cb()
        },
        (cb) => {
          asDAGLink(node2, 'some-link', (err, link) => {
            expect(err).to.not.exist()

            DAGNode.addLink(node1a, link)
              .then(node => {
                node1b = node
                cb()
              }, cb)
          })
        },
        (cb) => {
          ipfs.object.put(node1b, (err, cid) => {
            expect(err).to.not.exist()
            node1bCid = cid
            cb()
          })
        },
        (cb) => {
          ipfs.object.stat(node1bCid, (err, stats) => {
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

      ipfs.object.put(testObj, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.stat(cid.buffer, { enc: 'base58' }, (err, stats) => {
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

      ipfs.object.put(testObj, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.stat(cid.toBaseEncodedString(), { enc: 'base58' }, (err, stats) => {
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
