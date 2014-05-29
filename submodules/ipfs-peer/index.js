var mh = require('multihashes')

module.exports = Peer

function Peer(id, other) {
  if (!(this instanceof Peer))
    return new Peer(id, other)

  if (!(id instanceof Buffer))
    id = new Buffer(id, 'hex')

  if (!id)
    throw new Error('peer id is required')

  var err = mh.validate(id)
  if (err)
    throw new Error('peer id must be a valid multihash. ' + err)

  other = other || {}
  this.id = id
  this.pubkey = other.pubkey
  this.addresses = other.addresses
}
