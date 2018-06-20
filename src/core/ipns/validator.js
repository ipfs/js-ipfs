'use strict'

const IpnsEntry = require('./pb/ipnsEntry')

// Create IPNS Entry data for being signed
const getDataForSignature = (value, validityType, validity) => {
  const valueBuffer = Buffer.from(value)
  const validityTypeBuffer = Buffer.from(validityType.toString())
  const validityBuffer = Buffer.from(validity)

  return Buffer.concat([valueBuffer, validityTypeBuffer, validityBuffer])
}

// Sign IPNS Entry for publish
const sign = (privateKey, value, validityType, validity, callback) => {
  const dataForSignature = getDataForSignature(value, validityType, validity)

  privateKey.sign(dataForSignature, (err, signature) => {
    if (err) {
      return callback(err)
    }
    return callback(null, signature)
  })
}

// Verify IPNS entry on resolve
const verify = (publicKey, entry, callback) => {
  const { value, validityType, validity } = entry
  const dataForSignature = getDataForSignature(value, validityType, validity)

  // Validate Signature
  publicKey.verify(dataForSignature, entry.signature, (err, result) => {
    if (err) {
      return callback(err)
    }

    // Validate EOL
    if (validityType === IpnsEntry.validityType.EOL) {
      const validityDate = Date.parse(validity.toString())

      if (validityDate < Date.now()) {
        return callback(new Error('record has expired'))
      }
    }

    return callback(null, null)
  })
}

module.exports = {
  getDataForSignature,
  sign,
  verify
}
