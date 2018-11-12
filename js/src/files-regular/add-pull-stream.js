/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const pull = require('pull-stream')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.addPullStream', function () {
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

    it('should add pull stream of valid files and dirs', function (done) {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const emptyDir = (name) => ({ path: `test-folder/${name}` })

      const files = [
        content('pp.txt'),
        content('holmes.txt'),
        content('jungle.txt'),
        content('alice.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt'),
        content('files/ipfs.txt'),
        emptyDir('files/empty')
      ]

      const stream = ipfs.addPullStream()

      pull(
        pull.values(files),
        stream,
        pull.collect((err, filesAdded) => {
          expect(err).to.not.exist()

          filesAdded.forEach((file) => {
            if (file.path === 'test-folder') {
              expect(file.hash).to.equal(fixtures.directory.cid)
              done()
            }
          })
        })
      )
    })

    it('should add with object chunks and pull stream content', (done) => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      pull(
        pull.values([{ content: pull.values([Buffer.from('test')]) }]),
        ipfs.addPullStream(),
        pull.collect((err, res) => {
          if (err) return done(err)
          expect(res).to.have.length(1)
          expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
          done()
        })
      )
    })
  })
}
