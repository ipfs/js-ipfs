/* eslint-env mocha */
'use strict'

const { expectIsBandwidth } = require('./utils')
const { getDescribe, getIt } = require('../utils/mocha')
const getStream = require('get-stream')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.stats.bwReadableStream', () => {
    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get bandwidth stats over readable stream', async () => {
      const stream = ipfs.stats.bwReadableStream()

      const [data] = await getStream.array(stream)

      expectIsBandwidth(null, data)
    })
  })
}
