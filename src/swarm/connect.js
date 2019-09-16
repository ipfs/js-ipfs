/* eslint-env mocha */
'use strict'

const { getDescribe, getIt } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.swarm.connect', function () {
    this.timeout(80 * 1000)
    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = await common.setup()
      ipfsB = await common.setup()
    })

    after(() => common.teardown())

    it('should connect to a peer', (done) => {
      ipfsA.swarm.connect(ipfsB.peerId.addresses[0], done)
    })

    it('should connect to a peer (promised)', () => {
      return ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })
  })
}
