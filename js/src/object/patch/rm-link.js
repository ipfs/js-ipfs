/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const series = require('async/series')
const { getDescribe, getIt, expect } = require('../../utils/mocha')

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
      let node1a
      let node1b
      let node2
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
            node1a = node
            cb()
          })
        },
        (cb) => {
          ipfs.object.put(obj2, (err, node) => {
            expect(err).to.not.exist()
            node2 = node
            cb()
          })
        },
        (cb) => {
          testLink = new DAGLink('link-to-node', node2.size, node2.multihash)

          ipfs.object.patch.addLink(node1a.multihash, testLink, (err, node) => {
            expect(err).to.not.exist()
            node1b = node
            cb()
          })
        },
        (cb) => {
          ipfs.object.patch.rmLink(node1b.multihash, testLink, (err, node) => {
            expect(err).to.not.exist()
            expect(node.multihash).to.not.deep.equal(node1b.multihash)
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

    it('should remove a link from an existing node (promised)', () => {
      let node1a
      let node1b
      let node2
      let testLink

      const obj1 = {
        Data: Buffer.from('patch test object 1'),
        Links: []
      }

      const obj2 = {
        Data: Buffer.from('patch test object 2'),
        Links: []
      }

      return ipfs.object.put(obj1)
        .then((node) => { node1a = node })
        .then(() => ipfs.object.put(obj2))
        .then((node) => { node2 = node })
        .then(() => {
          testLink = new DAGLink('link-to-node', node2.size, node2.multihash)
          return ipfs.object.patch.addLink(node1a.multihash, testLink)
        })
        .then((node) => { node1b = node })
        .then(() => ipfs.object.patch.rmLink(node1b.multihash, testLink))
        .then((node) => expect(node.multihash).to.not.deep.equal(node1b.multihash))
    })
  })
}
