/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const series = require('async/series')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

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

      ipfs.object.put(obj, (err, node) => {
        expect(err).to.not.exist()
        const nodeJSON = node.toJSON()
        expect(nodeJSON.data).to.eql(obj.Data)
        expect(nodeJSON.links).to.eql(obj.Links)
        expect(nodeJSON.multihash).to.exist()
        done()
      })
    })

    it('should put an object (promised)', () => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      return ipfs.object.put(obj)
        .then((node) => {
          const nodeJSON = node.toJSON()
          expect(obj.Data).to.deep.equal(nodeJSON.data)
          expect(obj.Links).to.deep.equal(nodeJSON.links)
          expect(nodeJSON.multihash).to.exist()
        })
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

      ipfs.object.put(buf, { enc: 'json' }, (err, node) => {
        expect(err).to.not.exist()
        const nodeJSON = node.toJSON()

        expect(nodeJSON.data).to.eql(node.data)
        expect(nodeJSON.multihash).to.exist()
        done()
      })
    })

    it('should put a Protobuf encoded Buffer', (done) => {
      let node
      let serialized

      series([
        (cb) => {
          DAGNode.create(Buffer.from(hat()), (err, _node) => {
            expect(err).to.not.exist()
            node = _node
            cb()
          })
        },
        (cb) => {
          dagPB.util.serialize(node, (err, _serialized) => {
            expect(err).to.not.exist()
            serialized = _serialized
            cb()
          })
        },
        (cb) => {
          ipfs.object.put(serialized, { enc: 'protobuf' }, (err, storedNode) => {
            expect(err).to.not.exist()
            expect(node.data).to.deep.equal(node.data)
            expect(node.links).to.deep.equal(node.links)
            expect(node.multihash).to.eql(storedNode.multihash)
            cb()
          })
        }
      ], done)
    })

    it('should put a Buffer as data', (done) => {
      const data = Buffer.from(hat())
      ipfs.object.put(data, (err, node) => {
        expect(err).to.not.exist()
        const nodeJSON = node.toJSON()
        expect(data).to.deep.equal(nodeJSON.data)
        expect([]).to.deep.equal(nodeJSON.links)
        expect(nodeJSON.multihash).to.exist()
        done()
      })
    })

    it('should put a Protobuf DAGNode', (done) => {
      DAGNode.create(Buffer.from(hat()), (err, dNode) => {
        expect(err).to.not.exist()
        ipfs.object.put(dNode, (err, node) => {
          expect(err).to.not.exist()
          expect(dNode.data).to.deep.equal(node.data)
          expect(dNode.links).to.deep.equal(node.links)
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
          DAGNode.create(Buffer.from(hat()), (err, node) => {
            expect(err).to.not.exist()
            node1a = node
            cb()
          })
        },
        (cb) => {
          DAGNode.create(Buffer.from(hat()), (err, node) => {
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
          ipfs.object.put(node1b, (err, node) => {
            expect(err).to.not.exist()
            expect(node1b.data).to.deep.equal(node.data)
            expect(node1b.links.map((l) => l.toJSON()))
              .to.deep.equal(node.links.map((l) => l.toJSON()))
            cb()
          })
        }
      ], done)
    })
  })
}
