/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const concat = require('concat-stream')
const through = require('through2')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.getReadableStream', function () {
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

    before((done) => ipfs.add(fixtures.smallFile.data, done))

    after((done) => common.teardown(done))

    it('should return a Readable Stream of Readable Streams', (done) => {
      const stream = ipfs.getReadableStream(fixtures.smallFile.cid)
      const files = []

      stream.pipe(through.obj((file, enc, next) => {
        file.content.pipe(concat((content) => {
          files.push({ path: file.path, content: content })
          next()
        }))
      }, () => {
        expect(files).to.be.length(1)
        expect(files[0].path).to.eql(fixtures.smallFile.cid)
        expect(files[0].content.toString()).to.contain('Plz add me!')
        done()
      }))
    })
  })
}
