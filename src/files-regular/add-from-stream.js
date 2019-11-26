/* eslint-env mocha */
'use strict'

const { Readable } = require('readable-stream')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { fixtures } = require('./utils')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.addFromStream', function () {
    this.timeout(60 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should add from a stream', async () => {
      const stream = new Readable({
        read () {
          this.push(fixtures.bigFile.data)
          this.push(null)
        }
      })

      const result = await ipfs.addFromStream(stream)
      expect(result.length).to.equal(1)
      expect(result[0].hash).to.equal(fixtures.bigFile.cid)
    })
  })
}
