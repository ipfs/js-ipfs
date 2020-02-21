'use strict'

exports.get = async (request, h) => {
  const id = await request.server.app.ipfs.id()
  return h.response({
    ID: id.id,
    PublicKey: id.publicKey,
    Addresses: id.addresses,
    AgentVersion: id.agentVersion,
    ProtocolVersion: id.protocolVersion
  })
}
