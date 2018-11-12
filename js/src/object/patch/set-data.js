/* eslint-env mocha */
/* eslint-disable max-nested-callbacks */
'use strict'

const { getDescribe, getIt, expect } = require('../../utils/mocha')
const {
  calculateCid
} = require('../../utils/dag-pb')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.patch.setData', function () {
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

    it('should set data for an existing node', (done) => {
      const obj = {
        Data: Buffer.from('patch test object'),
        Links: []
      }

      ipfs.object.put(obj, (err, node) => {
        expect(err).to.not.exist()

        calculateCid(node, (err, nodeCid) => {
          expect(err).to.not.exist()

          ipfs.object.patch.setData(nodeCid, Buffer.from('set'), (err, patchedNode) => {
            expect(err).to.not.exist()

            calculateCid(patchedNode, (err, patchedNodeCid) => {
              expect(err).to.not.exist()

              done()
            })
          })
        })
      })
    })

    it('should set data for an existing node (promised)', async () => {
      const obj = {
        Data: Buffer.from('patch test object (promised)'),
        Links: []
      }

      const node = await ipfs.object.put(obj)
      const nodeCid = await calculateCid(node)
      const patchedNode = await ipfs.object.patch.setData(nodeCid, Buffer.from('set'))
      const patchedNodeCid = await calculateCid(patchedNode)

      expect(nodeCid).to.not.deep.equal(patchedNodeCid)
    })
  })
}
