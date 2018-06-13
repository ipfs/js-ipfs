'use strict'

const ipnsEntryProto = require('./ipns.proto')

module.exports = {
  // Create ipns data format
  create: (value, signature, validityType, validity, sequence, ttl, pubKey) => {
    // Handle validity type
    if (validityType !== undefined) {
      validityType = ipnsEntryProto.ValidityType.EOL
    }

    return {
      value: value,
      signature: signature,
      validityType: validityType,
      validity: validity,
      sequence: sequence,
      ttl: ttl,
      pubKey: pubKey
    }
  },
  // Marshal
  marshal: (ipnsEntry) => {
    return ipnsEntryProto.encode(ipnsEntry)
  },
  // Unmarshal
  unmarshal: (marsheled) => {
    return ipnsEntryProto.decode(marsheled)
  }
}
