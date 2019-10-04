/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const series = require('async/series')
const { getDescribe, getIt, expect } = require('../../utils/mocha')
const {
  calculateCid,
  createDAGNode,
  addLinkToDAGNode,
  asDAGLink
} = require('../utils')

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
      let testNodeCid
      let node1bCid
      let node1a
      let node1b
      let node2

      const obj = {
        Data: Buffer.from('patch test object'),
        Links: []
      }

      series([
        (cb) => {
          ipfs.object.put(obj, (err, cid) => {
            expect(err).to.not.exist()
            testNodeCid = cid
            cb()
          })
        },
        (cb) => {
          try {
            node1a = new DAGNode(obj.Data, obj.Links)
          } catch (err) {
            return cb(err)
          }

          cb()
        },
        (cb) => {
          try {
            node2 = new DAGNode(Buffer.from('some other node'))
          } catch (err) {
            return cb(err)
          }

          cb()
        },
        (cb) => {
          // note: we need to put the linked obj, otherwise IPFS won't
          // timeout. Reason: it needs the node to get its size
          ipfs.object.put(node2, (err, cid) => {
            expect(err).to.not.exist()

            cb()
          })
        },
        (cb) => {
          asDAGLink(node2, 'link-to-node', (err, link) => {
            expect(err).to.not.exist()

            node1b = new DAGNode(node1a.Data, node1a.Links.concat(link))

            cb()
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
          ipfs.object.patch.addLink(testNodeCid, node1b.Links[0], (err, cid) => {
            expect(err).to.not.exist()
            expect(node1bCid).to.eql(cid)
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

    it('should add a link to an existing node (promised)', async () => {
      const obj = {
        Data: Buffer.from('patch test object (promised)'),
        Links: []
      }

      const parentCid = await ipfs.object.put(obj)
      const parent = await ipfs.object.get(parentCid)
      const childCid = await ipfs.object.put(await createDAGNode(Buffer.from('some other node'), []))
      const child = await ipfs.object.get(childCid)
      const newParent = await addLinkToDAGNode(parent, {
        name: 'link-to-node',
        size: child.size,
        cid: childCid
      })
      const newParentCid = await calculateCid(newParent)
      const nodeFromObjectPatchCid = await ipfs.object.patch.addLink(parentCid, newParent.Links[0])

      expect(newParentCid).to.eql(nodeFromObjectPatchCid)
    })

    it('returns error for request without arguments', () => {
      return ipfs.object.patch.addLink(null, null, null)
        .then(
          () => expect.fail('should have returned an error for invalid argument'),
          (err) => expect(err).to.be.an.instanceof(Error)
        )
    })

    it('returns error for request with only one invalid argument', () => {
      return ipfs.object.patch.addLink('invalid', null, null)
        .then(
          () => expect.fail('should have returned an error for invalid argument'),
          (err) => expect(err).to.be.an.instanceof(Error)
        )
    })
  })
}
