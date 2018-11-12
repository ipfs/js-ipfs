/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const series = require('async/series')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const UnixFs = require('ipfs-unixfs')
const crypto = require('crypto')
const {
  calculateCid,
  asDAGLink
} = require('../utils/dag-pb')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.get', function () {
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

    it('should get object by multihash', (done) => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      let node1
      let node1Cid
      let node2

      series([
        (cb) => {
          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist()
            node1 = node

            calculateCid(node, (err, result) => {
              expect(err).to.not.exist()

              node1Cid = result

              cb()
            })
          })
        },
        (cb) => {
          ipfs.object.get(node1Cid, (err, node) => {
            expect(err).to.not.exist()
            node2 = node

            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node2.data === 'string') {
              node2.data = Buffer.from(node2.data)
            }
            cb()
          })
        },
        (cb) => {
          expect(node1.data).to.eql(node2.data)
          expect(node1.links).to.eql(node2.links)
          cb()
        }
      ], done)
    })

    it('should get object by multihash (promised)', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const node1 = await ipfs.object.put(testObj)
      const node1Cid = await calculateCid(node1)
      const node2 = await ipfs.object.get(node1Cid)

      // because js-ipfs-api can't infer if the
      // returned Data is Buffer or String
      if (typeof node2.data === 'string') {
        node2.data = Buffer.from(node2.data)
      }

      expect(node1.data).to.deep.equal(node2.data)
      expect(node1.links).to.deep.equal(node2.links)
    })

    it('should get object by multihash string', (done) => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      let node1
      let node1Cid
      let node2
      let node2Cid

      series([
        (cb) => {
          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist()
            node1 = node

            calculateCid(node, (err, result) => {
              expect(err).to.not.exist()

              node1Cid = result

              cb()
            })
          })
        },
        (cb) => {
          // get object from ipfs multihash string
          ipfs.object.get(node1Cid.toBaseEncodedString(), (err, node) => {
            expect(err).to.not.exist()
            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node.data === 'string') {
              node.data = Buffer.from(node.data)
            }
            node2 = node

            calculateCid(node, (err, result) => {
              expect(err).to.not.exist()

              node2Cid = result

              cb()
            })
          })
        },
        (cb) => {
          expect(node1.data).to.eql(node2.data)
          expect(node1.links).to.eql(node2.links)
          expect(node1Cid).to.deep.eql(node2Cid)
          cb()
        }
      ], done)
    })

    it('should get object by multihash string (promised)', async () => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const node1 = await ipfs.object.put(obj)
      const node1Cid = await calculateCid(node1)
      const node2 = await ipfs.object.get(node1Cid.toBaseEncodedString())
      const node2Cid = await calculateCid(node2)
      // because js-ipfs-api can't infer if the
      // returned Data is Buffer or String
      if (typeof node2.data === 'string') {
        node2.data = Buffer.from(node2.data)
      }

      expect(node1.data).to.deep.equal(node2.data)
      expect(node1.links).to.deep.equal(node2.links)
      expect(node1Cid).to.deep.eql(node2Cid)
    })

    it('should get object with links by multihash string', (done) => {
      let node1a
      let node1b
      let node1bCid
      let node1c
      let node1cCid
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
          asDAGLink(node2, 'some-link', (err, link) => {
            expect(err).to.not.exist()

            DAGNode.addLink(node1a, link, (err, node) => {
              expect(err).to.not.exist()
              node1b = node
              cb()
            })
          })
        },
        (cb) => {
          ipfs.object.put(node1b, (err, node) => {
            expect(err).to.not.exist()

            calculateCid(node, (err, result) => {
              expect(err).to.not.exist()

              node1bCid = result

              cb()
            })
          })
        },
        (cb) => {
          ipfs.object.get(node1bCid, (err, node) => {
            expect(err).to.not.exist()

            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node.data === 'string') {
              node.data = Buffer.from(node.data)
            }

            node1c = node

            calculateCid(node, (err, result) => {
              expect(err).to.not.exist()

              node1cCid = result

              cb()
            })
          })
        },
        (cb) => {
          expect(node1a.data).to.eql(node1c.data)
          expect(node1bCid).to.eql(node1cCid)
          cb()
        }
      ], done)
    })

    it('should get object by base58 encoded multihash', (done) => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      let node1a
      let node1aCid
      let node1b
      let node1bCid

      series([
        (cb) => {
          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist()
            node1a = node

            calculateCid(node, (err, result) => {
              expect(err).to.not.exist()

              node1aCid = result

              cb()
            })
          })
        },
        (cb) => {
          ipfs.object.get(node1aCid, { enc: 'base58' }, (err, node) => {
            expect(err).to.not.exist()
            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node.data === 'string') {
              node.data = Buffer.from(node.data)
            }
            node1b = node

            calculateCid(node, (err, result) => {
              expect(err).to.not.exist()

              node1bCid = result

              cb()
            })
          })
        },
        (cb) => {
          expect(node1aCid).to.deep.eql(node1bCid)
          expect(node1a.data).to.eql(node1b.data)
          expect(node1a.links).to.eql(node1b.links)
          cb()
        }
      ], done)
    })

    it('should get object by base58 encoded multihash string', (done) => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      let node1a
      let node1aCid
      let node1b
      let node1bCid

      series([
        (cb) => {
          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist()
            node1a = node

            calculateCid(node, (err, result) => {
              expect(err).to.not.exist()

              node1aCid = result

              cb()
            })
          })
        },
        (cb) => {
          ipfs.object.get(node1aCid.toBaseEncodedString(), { enc: 'base58' }, (err, node) => {
            expect(err).to.not.exist()
            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node.data === 'string') {
              node.data = Buffer.from(node.data)
            }
            node1b = node

            calculateCid(node, (err, result) => {
              expect(err).to.not.exist()

              node1bCid = result

              cb()
            })
          })
        },
        (cb) => {
          expect(node1aCid).to.deep.eql(node1bCid)
          expect(node1a.data).to.eql(node1b.data)
          expect(node1a.links).to.eql(node1b.links)
          cb()
        }
      ], done)
    })

    it('supplies unadulterated data', () => {
      // has to be big enough to span several DAGNodes
      let required = 1024 * 3000

      // can't just request `required` random bytes in the browser yet
      // as it's more than 65536:
      // https://github.com/crypto-browserify/randombytes/pull/15
      let data = Buffer.alloc(0)
      const maxBytes = 65536
      let next = maxBytes

      while (data.length !== required) {
        data = Buffer.concat([data, crypto.randomBytes(next)])
        next = maxBytes

        if (data.length + maxBytes > required) {
          next = required - data.length
        }
      }

      return ipfs.files.add({
        path: '',
        content: data
      })
        .then((result) => {
          return ipfs.object.get(result[0].hash)
        })
        .then((node) => {
          const meta = UnixFs.unmarshal(node.data)

          expect(meta.fileSize()).to.equal(data.length)
        })
    })
  })
}
