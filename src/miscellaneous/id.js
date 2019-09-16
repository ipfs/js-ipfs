/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.id', function () {
    this.timeout(60 * 1000)
    let ipfs

    before(function (done) {
      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => {
      common.teardown(done)
    })

    it('should get the node ID', (done) => {
      ipfs.id((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.have.a.property('id')
        expect(res).to.have.a.property('publicKey')
        done()
      })
    })

    it('should get the node ID (promised)', () => {
      return ipfs.id()
        .then((res) => {
          expect(res).to.have.a.property('id')
          expect(res).to.have.a.property('publicKey')
        })
    })
  })
}
