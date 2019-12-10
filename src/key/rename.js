/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.key.rename', () => {
    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should rename a key', async function () {
      this.timeout(30 * 1000)

      const oldName = hat()
      const newName = hat()

      const key = await ipfs.key.gen(oldName, { type: 'rsa', size: 2048 })

      const renameRes = await ipfs.key.rename(oldName, newName)
      expect(renameRes).to.exist()
      expect(renameRes).to.have.property('was', oldName)
      expect(renameRes).to.have.property('now', newName)
      expect(renameRes).to.have.property('id', key.id)

      const res = await ipfs.key.list()
      expect(res.find(k => k.name === newName)).to.exist()
      expect(res.find(k => k.name === oldName)).to.not.exist()
    })
  })
}
