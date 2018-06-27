/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.new', function () {
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

    it('should create a new object with no template', (done) => {
      ipfs.object.new((err, node) => {
        expect(err).to.not.exist()
        const nodeJSON = node.toJSON()
        expect(nodeJSON.multihash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
        done()
      })
    })

    it('should create a new object with no template (promised)', () => {
      return ipfs.object.new()
        .then((node) => {
          const nodeJSON = node.toJSON()
          expect(nodeJSON.multihash).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
        })
    })

    it('should create a new object with unixfs-dir template', (done) => {
      ipfs.object.new('unixfs-dir', (err, node) => {
        expect(err).to.not.exist()
        const nodeJSON = node.toJSON()
        expect(nodeJSON.multihash)
          .to.equal('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
        done()
      })
    })
  })
}
