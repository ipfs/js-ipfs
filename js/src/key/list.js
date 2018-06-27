/* eslint-env mocha */
'use strict'

const times = require('async/times')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.key.list', () => {
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

    it('should list all the keys', function (done) {
      this.timeout(60 * 1000)

      times(3, (n, cb) => {
        ipfs.key.gen(hat(), { type: 'rsa', size: 2048 }, cb)
      }, (err, keys) => {
        expect(err).to.not.exist()

        ipfs.key.list((err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res).to.be.an('array')
          expect(res.length).to.be.above(keys.length - 1)

          keys.forEach(key => {
            const found = res.find(({ id, name }) => name === key.name && id === key.id)
            expect(found).to.exist()
          })

          done()
        })
      })
    })
  })
}
