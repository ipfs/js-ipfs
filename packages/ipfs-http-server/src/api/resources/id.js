import Joi from '../../utils/joi.js'

export const idResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        timeout: Joi.timeout(),
        peerId: Joi.peerId()
      })
        .rename('arg', 'peerId', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
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
        timeout,
        peerId
      }
    } = request

    const id = await ipfs.id({
      signal,
      timeout,
      peerId
    })
    return h.response({
      ID: id.id.toString(),
      PublicKey: id.publicKey,
      Addresses: id.addresses,
      AgentVersion: id.agentVersion,
      ProtocolVersion: id.protocolVersion,
      Protocols: id.protocols
    })
  }
}
