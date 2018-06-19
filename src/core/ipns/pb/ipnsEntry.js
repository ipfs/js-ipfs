'use strict'

const ipnsEntryProto = require('./ipns.proto')

module.exports = {
  // Create ipns data format
  create: (value, signature, validityType, validity, sequence, ttl, pubKey) => {
    // Handle validity type
    if (validityType !== undefined) {
      validityType = ipnsEntryProto.ValidityType.EOL
    }

    const entry = {
      value: value,
      signature: signature,
      validityType: validityType,
      validity: validity,
      sequence: sequence,
      ttl: ttl,
      pubKey: pubKey
    }

    return Object.keys(entry).reduce((acc, key) => {
      const reducedEntry = acc

      if (entry[key] !== undefined) {
        reducedEntry[key] = entry[key]
      }

      return reducedEntry
    }, {})
  },
  // Marshal
  marshal: (ipnsEntry) => {
    return ipnsEntryProto.encode(ipnsEntry)
  },
  // Unmarshal
  unmarshal: (marsheled) => {
    return ipnsEntryProto.decode(marsheled)
  },
  validityType: ipnsEntryProto.ValidityType
}
