/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.swarm.localAddrs', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should list local addresses the node is listening on', (done) => {
      ipfs.swarm.localAddrs((err, multiaddrs) => {
        expect(err).to.not.exist()
        expect(multiaddrs).to.have.length.above(0)
        done()
      })
    })

    it('should list local addresses the node is listening on (promised)', () => {
      return ipfs.swarm.localAddrs().then((multiaddrs) => {
        expect(multiaddrs).to.have.length.above(0)
      })
    })
  })
}
