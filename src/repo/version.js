/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.repo.version', () => {
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

    it('should get the repo version', (done) => {
      ipfs.repo.version((err, version) => {
        expect(err).to.not.exist()
        expect(version).to.exist()
        done()
      })
    })

    it('should get the repo version (promised)', () => {
      return ipfs.repo.version().then((version) => {
        expect(version).to.exist()
      })
    })
  })
}
