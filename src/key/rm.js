/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.key.rm', () => {
    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should rm a key', async function () {
      this.timeout(30 * 1000)

      const key = await ipfs.key.gen(hat(), { type: 'rsa', size: 2048 })

      const removeRes = await ipfs.key.rm(key.name)
      expect(removeRes).to.exist()
      expect(removeRes).to.have.property('name', key.name)
      expect(removeRes).to.have.property('id', key.id)

      const res = await ipfs.key.list()
      expect(res.find(k => k.name === key.name)).to.not.exist()
    })
  })
}
