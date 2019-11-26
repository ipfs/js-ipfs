/* eslint-env mocha */
'use strict'

const { getDescribe, getIt } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.put', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeB

    before(async () => {
      nodeA = await common.setup()
      nodeB = await common.setup()
      await nodeA.swarm.connect(nodeB.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should put a value to the DHT', async () => {
      const key = Buffer.from('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
      const data = Buffer.from('data')

      await nodeA.dht.put(key, data)
    })
  })
}
