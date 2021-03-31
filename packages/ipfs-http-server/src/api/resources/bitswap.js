'use strict'

const Joi = require('../../utils/joi')
const { cidToString } = require('ipfs-core-utils/src/cid')

exports.wantlist = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        peer: Joi.cid(),
        cidBase: Joi.cidBase(),
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

    return h.response({
      Keys: list.map(cid => ({
        '/': cidToString(cid, { base: cidBase, upgrade: false })
      }))
    })
  }
}

exports.stat = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cidBase: Joi.cidBase(),
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

    return h.response({
      ProvideBufLen: stats.provideBufLen,
      BlocksReceived: stats.blocksReceived.toString(),
      Wantlist: stats.wantlist.map(cid => ({
        '/': cidToString(cid, { base: cidBase, upgrade: false })
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

exports.unwant = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.cidBase(),
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

    return h.response({ key: cidToString(cid, { base: cidBase, upgrade: false }) })
  }
}
