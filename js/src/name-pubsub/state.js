/* eslint-env mocha */
'use strict'

const { spawnNodeWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.name.pubsub.state', function () {
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodeWithId(factory, (err, node) => {
          expect(err).to.not.exist()

          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    it('should get the current state of pubsub', function (done) {
      this.timeout(50 * 1000)

      ipfs.name.pubsub.state((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.have.property('enabled')
        expect(res.enabled).to.be.eql(true)

        done()
      })
    })
  })
}
