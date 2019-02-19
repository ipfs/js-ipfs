/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const series = require('async/series')
const { getDescribe, getIt, expect } = require('../../utils/mocha')
const { asDAGLink } = require('../utils')

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
          ipfs.object.put(obj1, (err, cid) => {
            expect(err).to.not.exist()
            node1aCid = cid
            cb()
          })
        },
        (cb) => {
          ipfs.object.put(obj2, (err, cid) => {
            expect(err).to.not.exist()
            node2Cid = cid

            ipfs.object.get(cid, (err, node) => {
              expect(err).to.not.exist()
              node2 = node
              cb()
            })
          })
        },
        (cb) => {
          testLink = new DAGLink('link-to-node', node2.size, node2Cid)

          ipfs.object.patch.addLink(node1aCid, testLink, (err, cid) => {
            expect(err).to.not.exist()
            node1bCid = cid
            cb()
          })
        },
        (cb) => {
          ipfs.object.patch.rmLink(node1bCid, testLink, (err, cid) => {
            expect(err).to.not.exist()
            expect(cid).to.not.deep.equal(node1bCid)
            expect(cid).to.deep.equal(node1aCid)
            cb()
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

      const nodeCid = await ipfs.object.put(obj1)
      const childCid = await ipfs.object.put(obj2)
      const child = await ipfs.object.get(childCid)
      const childAsDAGLink = await asDAGLink(child, 'my-link')
      const parentCid = await ipfs.object.patch.addLink(nodeCid, childAsDAGLink)
      const withoutChildCid = await ipfs.object.patch.rmLink(parentCid, childAsDAGLink)

      expect(withoutChildCid).to.not.deep.equal(parentCid)
      expect(withoutChildCid).to.deep.equal(nodeCid)
    })
  })
}
