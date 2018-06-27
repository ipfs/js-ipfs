/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  const invalidArg = 'this/Is/So/Invalid/'

  describe('.bootstrap.rm', function () {
    this.timeout(100 * 1000)

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

    it('should return an error when called with an invalid arg', (done) => {
      ipfs.bootstrap.rm(invalidArg, (err) => {
        expect(err).to.be.an.instanceof(Error)
        done()
      })
    })

    it('should return an empty list because no peers removed when called without an arg or options', (done) => {
      ipfs.bootstrap.rm(null, (err, res) => {
        expect(err).to.not.exist()
        const peers = res.Peers
        expect(peers).to.exist()
        expect(peers.length).to.eql(0)
        done()
      })
    })

    it('should return a list containing the peer removed when called with a valid arg (ip4)', (done) => {
      ipfs.bootstrap.rm(null, (err, res) => {
        expect(err).to.not.exist()
        const peers = res.Peers
        expect(peers).to.exist()
        expect(peers.length).to.eql(0)
        done()
      })
    })

    it('should return a list of all peers removed when all option is passed', (done) => {
      ipfs.bootstrap.rm(null, { all: true }, (err, res) => {
        expect(err).to.not.exist()
        const peers = res.Peers
        expect(peers).to.exist()
        done()
      })
    })
  })
}
