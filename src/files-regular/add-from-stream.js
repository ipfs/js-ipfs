/* eslint-env mocha */
'use strict'

const loadFixture = require('aegir/fixtures')
const into = require('into-stream')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.addFromStream', function () {
    this.timeout(40 * 1000)

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

    it('should add from a stream', (done) => {
      const testData = loadFixture('test/fixtures/15mb.random', 'interface-ipfs-core')

      ipfs.addFromStream(into(testData), (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.equal(1)
        done()
      })
    })
  })
}
