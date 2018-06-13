'use strict'

module.exports = {
  generateIpnsDsKey: (peerId) => `/ipns/${peerId.toB58String()}`, // TODO I think it should be base 32, according to go
  buildIpnsKeysForId: (peerId) => ({
    nameKey: `/pk/${peerId.toB58String()}`,
    ipnsKey: `/ipns/${peerId.toB58String()}`
  })
}
