/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const series = require('async/series')
const { getDescribe, getIt, expect } = require('../../utils/mocha')
const {
  calculateCid,
  asDAGLink
} = require('../../utils/dag-pb')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.patch.rmLink', function () {
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

    it('should remove a link from an existing node', (done) => {
      let node1aCid
      let node1bCid
      let node2
      let node2Cid
      let testLink

      const obj1 = {
        Data: Buffer.from('patch test object 1'),
        Links: []
      }

      const obj2 = {
        Data: Buffer.from('patch test object 2'),
        Links: []
      }

      series([
        (cb) => {
          ipfs.object.put(obj1, (err, node) => {
            expect(err).to.not.exist()

            calculateCid(node, (err, result) => {
              expect(err).to.not.exist()

              node1aCid = result

              cb()
            })
          })
        },
        (cb) => {
          ipfs.object.put(obj2, (err, node) => {
            expect(err).to.not.exist()
            node2 = node

            calculateCid(node, (err, result) => {
              expect(err).to.not.exist()

              node2Cid = result

              cb()
            })
          })
        },
        (cb) => {
          testLink = new DAGLink('link-to-node', node2.size, node2Cid)

          ipfs.object.patch.addLink(node1aCid, testLink, (err, node) => {
            expect(err).to.not.exist()

            calculateCid(node, (err, result) => {
              expect(err).to.not.exist()

              node1bCid = result

              cb()
            })
          })
        },
        (cb) => {
          ipfs.object.patch.rmLink(node1bCid, testLink, (err, node) => {
            expect(err).to.not.exist()

            calculateCid(node, (err, result) => {
              expect(err).to.not.exist()

              expect(result).to.not.deep.equal(node1bCid)
              expect(result).to.deep.equal(node1aCid)

              cb()
            })
          })
        }
        /* TODO: revisit this assertions.
        (cb) => {
          ipfs.object.patch.rmLink(testNodeWithLinkMultihash, testLinkPlainObject, (err, node) => {
            expect(err).to.not.exist()
            expect(node.multihash).to.not.deep.equal(testNodeWithLinkMultihash)
            cb()
          })
        }
        */
      ], done)
    })

    it('should remove a link from an existing node (promised)', async () => {
      const obj1 = {
        Data: Buffer.from('patch test object 1'),
        Links: []
      }

      const obj2 = {
        Data: Buffer.from('patch test object 2'),
        Links: []
      }

      const node = await ipfs.object.put(obj1)
      const nodeCid = await calculateCid(node)
      const child = await ipfs.object.put(obj2)
      const childAsDAGLink = await asDAGLink(child, 'my-link')
      const parent = await ipfs.object.patch.addLink(nodeCid, childAsDAGLink)
      const parentCid = await calculateCid(parent)
      const withoutChild = await ipfs.object.patch.rmLink(parentCid, childAsDAGLink)
      const withoutChildCid = await calculateCid(withoutChild)

      expect(withoutChildCid).to.not.deep.equal(parentCid)
      expect(withoutChildCid).to.deep.equal(nodeCid)
    })
  })
}
