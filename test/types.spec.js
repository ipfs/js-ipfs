/* eslint-env mocha */
'use strict'

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')
const multibase = require('multibase')
const multihash = require('multihashes')
const CID = require('cids')

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSApi = require('../src')

const f = require('./utils/factory')

describe('.types', function () {
  this.timeout(20 * 1000)

  let ipfsd
  let ipfs

  before((done) => {
    f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => {
    if (!ipfsd) return done()
    ipfsd.stop(done)
  })

  it('types object', () => {
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
