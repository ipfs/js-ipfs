/*
 * Id is an object representation of a peer Id. a peer Id is a multihash
 */

var multihashing = require('multihashing')
var base58 = require('bs58')
var crypto = require('crypto')

exports = module.exports = Id

function Id (id, pubKey, privKey) {
  var self = this

  if (!(self instanceof Id)) {
    throw new Error('Id must be called with new')
  }

  self.privKey = privKey
  self.pubKey = pubKey
  self.id = id // multihash - sha256 - buffer

  // pretty print

  self.toPrint = function () {
    return {
      id: id.toHexString(),
      privKey: privKey.toString('hex'),
      pubKey: pubKey.toString('hex')
    }
  }

  // encode/decode functions

  self.toHexString = function () {
    return self.id.toString('hex')
  }

  self.toBytes = function () {
    return self.id
  }

  self.toB58String = function () {
    return base58.encode(self.id)
  }

}

// generation

exports.create = function () {
  var ecdh = crypto.createECDH('secp256k1')
  ecdh.generateKeys()

  var mhId = multihashing(ecdh.getPublicKey(), 'sha2-256')

  return new Id(mhId, ecdh.getPrivateKey(), ecdh.getPublicKey())
}

exports.createFromHexString = function (str) {
  return new Id(new Buffer(str), 'hex')
}

exports.createFromBytes = function (buf) {
  return new Id(buf)
}

exports.createFromB58String = function (str) {
  return new Id(new Buffer(base58.decode(str)))
}

exports.createFromPubKey = function (pubKey) {
  var mhId = multihashing(pubKey, 'sha2-256')

  return new Id(mhId, null, pubKey)
}

exports.createFromPrivKey = function () {
  // TODO(daviddias) derive PubKey from priv
}
