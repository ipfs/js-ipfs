/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const bl = require('bl')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.catReadableStream', function () {
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

    before((done) => ipfs.files.add(fixtures.bigFile.data, done))
    before((done) => ipfs.files.add(fixtures.smallFile.data, done))

    after((done) => common.teardown(done))

    it('should return a Readable Stream for a CID', (done) => {
      const stream = ipfs.files.catReadableStream(fixtures.bigFile.cid)

      stream.pipe(bl((err, data) => {
        expect(err).to.not.exist()
        expect(data).to.eql(fixtures.bigFile.data)
        done()
      }))
    })

    it('should export a chunk of a file in a Readable Stream', (done) => {
      const offset = 1
      const length = 3

      const stream = ipfs.files.catReadableStream(fixtures.smallFile.cid, {
        offset,
        length
      })

      stream.pipe(bl((err, data) => {
        expect(err).to.not.exist()
        expect(data.toString()).to.equal('lz ')
        done()
      }))
    })
  })
}
