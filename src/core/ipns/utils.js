'use strict'

const base32Encode = require('base32-encode')

// rawStdEncoding as go
// Created issue for allowing this inside base32-encode https://github.com/LinusU/base32-encode/issues/2
const rawStdEncoding = (key) => base32Encode(key, 'RFC4648').replace('=', '')

module.exports = {
  generateIpnsDsKey: (key) => `/ipns/${rawStdEncoding(key)}`,
  buildIpnsKeysForId: (peerId) => ({
    nameKey: `/pk/${peerId.toB58String()}`,
    ipnsKey: `/ipns/${peerId.toB58String()}`
  })
}
