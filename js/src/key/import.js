/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.key.import', () => {
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

    it('should import an exported key', (done) => {
      const password = hat()

      ipfs.key.export('self', password, (err, pem) => {
        expect(err).to.not.exist()
        expect(pem).to.exist()

        ipfs.key.import('clone', pem, password, (err, key) => {
          expect(err).to.not.exist()
          expect(key).to.exist()
          expect(key).to.have.property('name', 'clone')
          expect(key).to.have.property('id')
          done()
        })
      })
    })
  })
}
