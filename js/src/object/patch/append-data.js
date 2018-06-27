/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.patch.appendData', function () {
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

    it('should append data to an existing node', (done) => {
      const obj = {
        Data: Buffer.from('patch test object'),
        Links: []
      }

      ipfs.object.put(obj, (err, node) => {
        expect(err).to.not.exist()

        ipfs.object.patch.appendData(node.multihash, Buffer.from('append'), (err, patchedNode) => {
          expect(err).to.not.exist()
          expect(patchedNode.multihash).to.not.deep.equal(node.multihash)
          done()
        })
      })
    })

    it('should append data to an existing node (promised)', () => {
      const obj = {
        Data: Buffer.from('patch test object (promised)'),
        Links: []
      }

      return ipfs.object.put(obj)
        .then((node) => {
          return ipfs.object.patch.appendData(node.multihash, Buffer.from('append'))
            .then((patchedNode) => ({ patchedNode, node }))
        })
        .then(({ patchedNode, node }) => {
          expect(patchedNode.multihash).to.not.deep.equal(node.multihash)
        })
    })
  })
}
