'use strict'

const Joi = require('../../utils/joi')
const { cidToString } = require('../../../utils/cid')

exports.wantlist = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        peer: Joi.peerId(),
        cidBase: Joi.cidBase(),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
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

    stats.wantlist = stats.wantlist.map(cid => ({
      '/': cidToString(cid, { base: cidBase, upgrade: false })
    }))

    return h.response({
      ProvideBufLen: stats.provideBufLen,
      BlocksReceived: stats.blocksReceived,
      Wantlist: stats.wantlist,
      Peers: stats.peers,
      DupBlksReceived: stats.dupBlksReceived,
      DupDataReceived: stats.dupDataReceived,
      DataReceived: stats.dataReceived,
      BlocksSent: stats.blocksSent,
      DataSent: stats.dataSent
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
  // main route handler which is called after the above `parseArgs`, but only if the args were valid
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
