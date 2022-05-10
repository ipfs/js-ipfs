import Joi from '../../utils/joi.js'

export const wantlistResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        peer: Joi.peerId(),
        cidBase: Joi.string().default('base58btc'),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
    }
  },

  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
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
        peer,
        cidBase,
        timeout
      }
    } = request

    let list

    if (peer) {
      list = await ipfs.bitswap.wantlistForPeer(peer, {
        signal,
        timeout
      })
    } else {
      list = await ipfs.bitswap.wantlist({
        signal,
        timeout
      })
    }

    const base = await ipfs.bases.getBase(cidBase)

    return h.response({
      Keys: list.map(cid => ({
        '/': cid.toString(base.encoder)
      }))
    })
  }
}

export const statResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cidBase: Joi.string().default('base58btc'),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
    }
  },

  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
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
        cidBase,
        timeout
      }
    } = request

    const stats = await ipfs.bitswap.stat({
      signal,
      timeout
    })

    const base = await ipfs.bases.getBase(cidBase)

    return h.response({
      ProvideBufLen: stats.provideBufLen,
      BlocksReceived: stats.blocksReceived.toString(),
      Wantlist: stats.wantlist.map(cid => ({
        '/': cid.toString(base.encoder)
      })),
      Peers: stats.peers,
      DupBlksReceived: stats.dupBlksReceived.toString(),
      DupDataReceived: stats.dupDataReceived.toString(),
      DataReceived: stats.dataReceived.toString(),
      BlocksSent: stats.blocksSent.toString(),
      DataSent: stats.dataSent.toString()
    })
  }
}

export const unwantResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.string().default('base58btc'),
        timeout: Joi.timeout()
      })
        .rename('arg', 'cid', {
          override: true,
          ignoreUndefined: true
        })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
    }
  },

  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
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
        cid,
        cidBase,
        timeout
      }
    } = request

    await ipfs.bitswap.unwant(cid, {
      signal,
      timeout
    })

    const base = await ipfs.bases.getBase(cidBase)

    return h.response({ key: cid.toString(base.encoder) })
  }
}
