/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.key.gen', () => {
    const keyTypes = [
      { type: 'rsa', size: 2048 }
    ]

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

    keyTypes.forEach((kt) => {
      it(`should generate a new ${kt.type} key`, function (done) {
        this.timeout(20 * 1000)
        const name = hat()
        ipfs.key.gen(name, kt, (err, key) => {
          expect(err).to.not.exist()
          expect(key).to.exist()
          expect(key).to.have.property('name', name)
          expect(key).to.have.property('id')
          done()
        })
      })
    })
  })
}
