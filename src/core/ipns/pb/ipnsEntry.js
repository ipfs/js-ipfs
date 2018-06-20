'use strict'

const ipnsEntryProto = require('./ipns.proto')

const create = (value, signature, validityType, validity, sequence, ttl, pubKey) => {
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
}

module.exports = {
  // Create ipns data format
  create,
  // Marshal
  marshal: ipnsEntryProto.encode,
  // Unmarshal
  unmarshal: ipnsEntryProto.decode,
  validityType: ipnsEntryProto.ValidityType
}
