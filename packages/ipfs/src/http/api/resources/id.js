'use strict'

const Joi = require('../../utils/joi')

module.exports = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        timeout: Joi.timeout()
      })
    }
  },
  handler: async (request, h) => {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        timeout
      }
    } = request

    const id = await ipfs.id({
      signal,
      timeout
    })
    return h.response({
      ID: id.id,
      PublicKey: id.publicKey,
      Addresses: id.addresses,
      AgentVersion: id.agentVersion,
      ProtocolVersion: id.protocolVersion,
      Protocols: id.protocols
    })
  }
}
