/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.mkdir', function () {
    this.timeout(40 * 1000)

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

    it('should make directory on root', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.mkdir(testDir, (err) => {
        expect(err).to.not.exist()
        done()
      })
    })

    it('should make directory and its parents', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.mkdir(`${testDir}/lv1/lv2`, { p: true }, (err) => {
        expect(err).to.not.exist()
        done()
      })
    })

    it('should not make already existent directory', (done) => {
      ipfs.files.mkdir('/', (err) => {
        expect(err).to.exist()
        done()
      })
    })
  })
}
