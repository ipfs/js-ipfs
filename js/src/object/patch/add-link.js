/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const series = require('async/series')
const { getDescribe, getIt, expect } = require('../../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.patch.addLink', function () {
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

    it('should add a link to an existing node', (done) => {
      let testNodeMultihash
      let node1a
      let node1b
      let node2

      const obj = {
        Data: Buffer.from('patch test object'),
        Links: []
      }

      series([
        (cb) => {
          ipfs.object.put(obj, (err, node) => {
            expect(err).to.not.exist()
            testNodeMultihash = node.multihash
            cb()
          })
        },
        (cb) => {
          DAGNode.create(obj.Data, obj.Links, (err, node) => {
            expect(err).to.not.exist()
            node1a = node
            cb()
          })
        },
        (cb) => {
          DAGNode.create(Buffer.from('some other node'), (err, node) => {
            expect(err).to.not.exist()
            node2 = node
            cb()
          })
        },
        (cb) => {
          // note: we need to put the linked obj, otherwise IPFS won't
          // timeout. Reason: it needs the node to get its size
          ipfs.object.put(node2, cb)
        },
        (cb) => {
          const link = node2.toJSON()
          link.name = 'link-to-node'
          DAGNode.addLink(node1a, link, (err, node) => {
            expect(err).to.not.exist()
            node1b = node
            cb()
          })
        },
        (cb) => {
          ipfs.object.patch.addLink(testNodeMultihash, node1b.links[0], (err, node) => {
            expect(err).to.not.exist()
            expect(node1b.multihash).to.eql(node.multihash)
            cb()
          })
        }
        /* TODO: revisit this assertions.
        (cb) => {
          // note: make sure we can link js plain objects
          const content = Buffer.from(JSON.stringify({
            title: 'serialized object'
          }, null, 0))
          ipfs.add(content, (err, result) => {
            expect(err).to.not.exist()
            expect(result).to.exist()
            expect(result).to.have.lengthOf(1)
            const object = result.pop()
            node3 = {
              name: object.hash,
              multihash: object.hash,
              size: object.size
            }
            cb()
          })
        },
        (cb) => {
          ipfs.object.patch.addLink(testNodeWithLinkMultihash, node3, (err, node) => {
            expect(err).to.not.exist()
            expect(node).to.exist()
            testNodeWithLinkMultihash = node.multihash
            testLinkPlainObject = node3
            cb()
          })
        }
        */
      ], done)
    })

    it('should add a link to an existing node (promised)', () => {
      let testNodeMultihash
      let node1a
      let node1b
      let node2

      const obj = {
        Data: Buffer.from('patch test object (promised)'),
        Links: []
      }

      return ipfs.object.put(obj)
        .then((node) => {
          testNodeMultihash = node.multihash
        })
        .then(() => new Promise((resolve, reject) => {
          DAGNode.create(obj.Data, obj.Links, function (err, node) {
            if (err) {
              return reject(err)
            }
            return resolve(node)
          })
        }))
        .then((node) => {
          node1a = node
          return new Promise((resolve, reject) => {
            DAGNode.create(Buffer.from('some other node'), function (err, node) {
              if (err) {
                return reject(err)
              }
              return resolve(node)
            })
          }).then((node1) => {
            node2 = node1
            return ipfs.object.put(node2)
          })
        })
        .then(() => {
          const link = node2.toJSON()
          link.name = 'link-to-node'
          return new Promise((resolve, reject) => {
            DAGNode.addLink(node1a, link, function (err, node) {
              if (err) {
                return reject(err)
              }
              return resolve(node)
            })
          }).then((node) => {
            node1b = node
            return ipfs.object.patch.addLink(testNodeMultihash, node1b.links[0])
          })
        })
        .then((node) => {
          expect(node1b.multihash).to.eql(node.multihash)
        })
    })
  })
}
