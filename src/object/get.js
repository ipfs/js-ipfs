/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const series = require('async/series')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const UnixFs = require('ipfs-unixfs')
const crypto = require('crypto')
const { asDAGLink } = require('./utils')

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
          ipfs.object.put(obj, (err, cid) => {
            expect(err).to.not.exist()
            node1Cid = cid

            ipfs.object.get(cid, (err, node) => {
              expect(err).to.not.exist()
              node1 = node
              cb()
            })
          })
        },
        (cb) => {
          ipfs.object.get(node1Cid, (err, node) => {
            expect(err).to.not.exist()

            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node.Data === 'string') {
              node = DAGNode.create(Buffer.from(node.Data), node.Links, node.size)
            }

            node2 = node

            cb()
          })
        },
        (cb) => {
          expect(node1.Data).to.eql(node2.Data)
          expect(node1.Links).to.eql(node2.Links)
          cb()
        }
      ], done)
    })

    it('should get object by multihash (promised)', async () => {
      const testObj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const node1Cid = await ipfs.object.put(testObj)
      const node1 = await ipfs.object.get(node1Cid)
      let node2 = await ipfs.object.get(node1Cid)

      // because js-ipfs-api can't infer if the
      // returned Data is Buffer or String
      if (typeof node2.Data === 'string') {
        node2 = DAGNode.create(Buffer.from(node2.Data), node2.Links, node2.size)
      }

      expect(node1.Data).to.deep.equal(node2.Data)
      expect(node1.Links).to.deep.equal(node2.Links)
    })

    it('should get object by multihash string', (done) => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      let node1
      let node1Cid
      let node2

      series([
        (cb) => {
          ipfs.object.put(obj, (err, cid) => {
            expect(err).to.not.exist()
            node1Cid = cid

            ipfs.object.get(node1Cid, (err, node) => {
              expect(err).to.not.exist()
              node1 = node
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
            if (typeof node.Data === 'string') {
              node = DAGNode.create(Buffer.from(node.Data), node.Links, node.size)
            }

            node2 = node
            cb()
          })
        },
        (cb) => {
          expect(node1.Data).to.eql(node2.Data)
          expect(node1.Links).to.eql(node2.Links)
          cb()
        }
      ], done)
    })

    it('should get object by multihash string (promised)', async () => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const node1Cid = await ipfs.object.put(obj)
      const node1 = await ipfs.object.get(node1Cid)
      let node2 = await ipfs.object.get(node1Cid.toBaseEncodedString())

      // because js-ipfs-api can't infer if the
      // returned Data is Buffer or String
      if (typeof node2.Data === 'string') {
        node2 = DAGNode.create(Buffer.from(node2.Data), node2.Links, node2.size)
      }

      expect(node1.Data).to.deep.equal(node2.Data)
      expect(node1.Links).to.deep.equal(node2.Links)
    })

    it('should get object with links by multihash string', (done) => {
      let node1a
      let node1b
      let node1bCid
      let node1c
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
          ipfs.object.get(node1bCid, (err, node) => {
            expect(err).to.not.exist()

            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node.Data === 'string') {
              node = DAGNode.create(Buffer.from(node.Data), node.Links, node.size)
            }

            node1c = node
            cb()
          })
        },
        (cb) => {
          expect(node1a.Data).to.eql(node1c.Data)
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

      series([
        (cb) => {
          ipfs.object.put(obj, (err, cid) => {
            expect(err).to.not.exist()
            node1aCid = cid

            ipfs.object.get(cid, (err, node) => {
              expect(err).to.not.exist()
              node1a = node
              cb()
            })
          })
        },
        (cb) => {
          ipfs.object.get(node1aCid, { enc: 'base58' }, (err, node) => {
            expect(err).to.not.exist()
            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node.Data === 'string') {
              node = DAGNode.create(Buffer.from(node.Data), node.Links, node.size)
            }
            node1b = node
            cb()
          })
        },
        (cb) => {
          expect(node1a.Data).to.eql(node1b.Data)
          expect(node1a.Links).to.eql(node1b.Links)
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

      series([
        (cb) => {
          ipfs.object.put(obj, (err, cid) => {
            expect(err).to.not.exist()
            node1aCid = cid

            ipfs.object.get(cid, (err, node) => {
              expect(err).to.not.exist()
              node1a = node
              cb()
            })
          })
        },
        (cb) => {
          ipfs.object.get(node1aCid.toBaseEncodedString(), { enc: 'base58' }, (err, node) => {
            expect(err).to.not.exist()
            // because js-ipfs-api can't infer if the
            // returned Data is Buffer or String
            if (typeof node.Data === 'string') {
              node = DAGNode.create(Buffer.from(node.Data), node.Links, node.size)
            }
            node1b = node
            cb()
          })
        },
        (cb) => {
          expect(node1a.Data).to.eql(node1b.Data)
          expect(node1a.Links).to.eql(node1b.Links)
          cb()
        }
      ], done)
    })

    it('should supply unaltered data', () => {
      // has to be big enough to span several DAGNodes
      let data = crypto.randomBytes(1024 * 3000)

      return ipfs.add({
        path: '',
        content: data
      })
        .then((result) => {
          return ipfs.object.get(result[0].hash)
        })
        .then((node) => {
          const meta = UnixFs.unmarshal(node.Data)

          expect(meta.fileSize()).to.equal(data.length)
        })
    })
  })
}
