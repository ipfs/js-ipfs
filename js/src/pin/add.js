/* eslint-env mocha */
'use strict'

const each = require('async/each')
const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pin.add', function () {
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
        each(fixtures.files, (file, cb) => {
          ipfs.files.add(file.data, { pin: false }, cb)
        }, done)
      }
    })

    after((done) => common.teardown(done))

    it('should add a pin', (done) => {
      ipfs.pin.add(fixtures.files[0].cid, { recursive: false }, (err, pinset) => {
        expect(err).to.not.exist()
        expect(pinset).to.deep.include({
          hash: fixtures.files[0].cid
        })
        done()
      })
    })

    it('should add a pin (promised)', () => {
      return ipfs.pin.add(fixtures.files[1].cid, { recursive: false })
        .then((pinset) => {
          expect(pinset).to.deep.include({
            hash: fixtures.files[1].cid
          })
        })
    })
  })
}
