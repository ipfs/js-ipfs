/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.key.gen', function () {
    this.timeout(60 * 1000)
    const keyTypes = [
      { type: 'rsa', size: 2048 }
    ]

    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    keyTypes.forEach((kt) => {
      it(`should generate a new ${kt.type} key`, async function () {
        this.timeout(20 * 1000)
        const name = hat()
        const key = await ipfs.key.gen(name, kt)
        expect(key).to.exist()
        expect(key).to.have.property('name', name)
        expect(key).to.have.property('id')
      })
    })
  })
}
