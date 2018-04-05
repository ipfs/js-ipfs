'use strict'

const CID = require('cids')
const dagCBOR = require('ipld-dag-cbor')
const dagPB = require('ipld-dag-pb')
const multiaddr = require('multiaddr')
const multibase = require('multibase')
const multihash = require('multihashes')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')

module.exports = () => ({
  Buffer: Buffer,
  CID: CID,
  dagPB: dagPB,
  dagCBOR: dagCBOR,
  multiaddr: multiaddr,
  multibase: multibase,
  multihash: multihash,
  PeerId: PeerId,
  PeerInfo: PeerInfo
})
