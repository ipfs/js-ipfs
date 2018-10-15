/* eslint-env mocha */
'use strict'

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')
const multibase = require('multibase')
const multihash = require('multihashes')
const CID = require('cids')
const { getDescribe, getIt, expect } = require('./utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.types', function () {
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

    it('should have a types object with the required values', () => {
      expect(ipfs.types).to.be.deep.equal({
        Buffer: Buffer,
        PeerId: PeerId,
        PeerInfo: PeerInfo,
        multiaddr: multiaddr,
        multibase: multibase,
        multihash: multihash,
        CID: CID
      })
    })
  })
}
