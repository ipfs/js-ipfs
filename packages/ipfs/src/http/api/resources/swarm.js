'use strict'

const Joi = require('../../utils/joi')

exports.peers = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        verbose: Joi.boolean().default(false),
        direction: Joi.boolean().default(false),
        timeout: Joi.timeout()
      })
        .rename('v', 'verbose', {
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
        verbose,
        direction,
        timeout
      }
    } = request

    const peers = await ipfs.swarm.peers({
      verbose,
      signal,
      timeout
    })

    return h.response({
      Peers: peers.map((p) => {
        const res = {
          Peer: p.peer.toString(),
          Addr: p.addr.toString()
        }

        if (verbose || direction) {
          res.Direction = p.direction
        }

        if (verbose) {
          res.Muxer = p.muxer
          res.Latency = p.latency
        }

        return res
      })
    })
  }
}

exports.addrs = {
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
        timeout
      }
    } = request

    const peers = await ipfs.swarm.addrs({
      signal,
      timeout
    })

    return h.response({
      Addrs: peers.reduce((addrs, peer) => {
        addrs[peer.id.toString()] = peer.addrs.map(a => a.toString())
        return addrs
      }, {})
    })
  }
}

exports.localAddrs = {
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
        timeout
      }
    } = request

    const addrs = await ipfs.swarm.localAddrs({
      signal,
      timeout
    })

    return h.response({
      Strings: addrs.map((addr) => addr.toString())
    })
  }
}

exports.connect = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        addr: Joi.multiaddr().required(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'addr', {
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
        addr,
        timeout
      }
    } = request

    await ipfs.swarm.connect(addr, {
      signal,
      timeout
    })

    return h.response({
      Strings: [`connect ${addr} success`]
    })
  }
}

exports.disconnect = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        addr: Joi.multiaddr().required(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'addr', {
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
        addr,
        timeout
      }
    } = request

    await ipfs.swarm.disconnect(addr, {
      signal,
      timeout
    })

    return h.response({
      Strings: [`disconnect ${addr} success`]
    })
  }
}
