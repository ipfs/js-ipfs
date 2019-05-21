/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const series = require('async/series')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { asDAGLink } = require('./utils')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.put', function () {
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

    it('should put an object', (done) => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      ipfs.object.put(obj, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.get(cid, (err, node) => {
          expect(err).to.not.exist()
          const nodeJSON = node.toJSON()
          expect(nodeJSON.data).to.eql(obj.Data)
          expect(nodeJSON.links).to.eql(obj.Links)
          done()
        })
      })
    })

    it('should put an object (promised)', async () => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const cid = await ipfs.object.put(obj)
      const node = await ipfs.object.get(cid)

      const nodeJSON = node.toJSON()
      expect(obj.Data).to.deep.equal(nodeJSON.data)
      expect(obj.Links).to.deep.equal(nodeJSON.links)
    })

    it('should put a JSON encoded Buffer', (done) => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const obj2 = {
        Data: obj.Data.toString(),
        Links: obj.Links
      }

      const buf = Buffer.from(JSON.stringify(obj2))

      ipfs.object.put(buf, { enc: 'json' }, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.get(cid, (err, node) => {
          expect(err).to.not.exist()
          const nodeJSON = node.toJSON()
          expect(nodeJSON.data).to.eql(node.Data)
          done()
        })
      })
    })

    it('should put a Protobuf encoded Buffer', (done) => {
      let node
      let serialized

      series([
        (cb) => {
          try {
            node = DAGNode.create(Buffer.from(hat()))
          } catch (err) {
            return cb(err)
          }

          cb()
        },
        (cb) => {
          try {
            serialized = dagPB.util.serialize(node)
          } catch (err) {
            return cb(err)
          }

          cb()
        },
        (cb) => {
          ipfs.object.put(serialized, { enc: 'protobuf' }, (err, cid) => {
            expect(err).to.not.exist()
            ipfs.object.get(cid, (err, node2) => {
              expect(err).to.not.exist()
              expect(node2.Data).to.deep.equal(node.Data)
              expect(node2.Links).to.deep.equal(node.Links)
              cb()
            })
          })
        }
      ], done)
    })

    it('should put a Buffer as data', (done) => {
      const data = Buffer.from(hat())
      ipfs.object.put(data, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.get(cid, (err, node) => {
          expect(err).to.not.exist()
          const nodeJSON = node.toJSON()
          expect(data).to.deep.equal(nodeJSON.data)
          expect([]).to.deep.equal(nodeJSON.links)
          done()
        })
      })
    })

    it('should put a Protobuf DAGNode', (done) => {
      const dNode = DAGNode.create(Buffer.from(hat()))

      ipfs.object.put(dNode, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.get(cid, (err, node) => {
          expect(err).to.not.exist()
          expect(dNode.Data).to.deep.equal(node.Data)
          expect(dNode.Links).to.deep.equal(node.Links)
          done()
        })
      })
    })

    it('should fail if a string is passed', (done) => {
      ipfs.object.put(hat(), (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should put a Protobuf DAGNode with a link', (done) => {
      let node1a
      let node1b
      let node2

      series([
        (cb) => {
          try {
            node1a = DAGNode.create(Buffer.from(hat()))
          } catch (err) {
            return cb(err)
          }

          cb()
        },
        (cb) => {
          try {
            node2 = DAGNode.create(Buffer.from(hat()))
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

            ipfs.object.get(cid, (err, node) => {
              expect(err).to.not.exist()
              expect(node1b.Data).to.deep.equal(node.Data)
              expect(node1b.Links).to.deep.equal(node.Links)
              cb()
            })
          })
        }
      ], done)
    })
  })
}
