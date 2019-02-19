/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const pull = require('pull-stream')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.getPullStream', function () {
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

    it('should return a Pull Stream of Pull Streams', (done) => {
      const stream = ipfs.getPullStream(fixtures.smallFile.cid)

      pull(
        stream,
        pull.collect((err, files) => {
          expect(err).to.not.exist()
          expect(files).to.be.length(1)
          expect(files[0].path).to.eql(fixtures.smallFile.cid)
          pull(
            files[0].content,
            pull.concat((err, data) => {
              expect(err).to.not.exist()
              expect(data.toString()).to.contain('Plz add me!')
              done()
            })
          )
        })
      )
    })
  })
}
