/* eslint-env mocha */
'use strict'

const series = require('async/series')
const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pin.rm', function () {
    this.timeout(50 * 1000)

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
          populate()
        })
      })

      function populate () {
        series([
          cb => ipfs.add(fixtures.files[0].data, { pin: false }, cb),
          cb => ipfs.pin.add(fixtures.files[0].cid, { recursive: true }, cb),
          cb => ipfs.add(fixtures.files[1].data, { pin: false }, cb),
          cb => ipfs.pin.add(fixtures.files[1].cid, { recursive: false }, cb)
        ], done)
      }
    })

    after((done) => common.teardown(done))

    it('should remove a recursive pin', (done) => {
      ipfs.pin.rm(fixtures.files[0].cid, { recursive: true }, (err, pinset) => {
        expect(err).to.not.exist()
        expect(pinset).to.deep.equal([{
          hash: fixtures.files[0].cid
        }])
        ipfs.pin.ls({ type: 'recursive' }, (err, pinset) => {
          expect(err).to.not.exist()
          expect(pinset).to.not.deep.include({
            hash: fixtures.files[0].cid,
            type: 'recursive'
          })
          done()
        })
      })
    })

    it('should remove a direct pin (promised)', () => {
      return ipfs.pin.rm(fixtures.files[1].cid, { recursive: false })
        .then((pinset) => {
          expect(pinset).to.deep.equal([{
            hash: fixtures.files[1].cid
          }])
          return ipfs.pin.ls({ type: 'direct' })
        })
        .then((pinset) => {
          expect(pinset).to.not.deep.include({
            hash: fixtures.files[1].cid
          })
        })
    })
  })
}
