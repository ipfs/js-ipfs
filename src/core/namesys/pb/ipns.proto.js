'use strict'

const protons = require('protons')

/* eslint-disable no-tabs */
const message = `
message IpnsEntry {
  enum ValidityType {
		EOL = 0; // setting an EOL says "this record is valid until..."
	}

  required bytes value = 1;
	required bytes signature = 2;

	optional ValidityType validityType = 3;
	optional bytes validity = 4;

	optional uint64 sequence = 5;

	optional uint64 ttl = 6;

	// in order for nodes to properly validate a record upon receipt, they need the public
	// key associated with it. For old RSA keys, its easiest if we just send this as part of
	// the record itself. For newer ed25519 keys, the public key can be embedded in the
	// peerID, making this field unnecessary.
	optional bytes pubKey = 7;
}
`

module.exports = protons(message).IpnsEntry
