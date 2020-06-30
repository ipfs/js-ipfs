'use strict'

const Joi = require('../../../utils/joi')
const { cidToString } = require('../../../../utils/cid')

const mfsFlush = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        path: Joi.string().default('/'),
        cidBase: Joi.cidBase(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'path', {
          override: true,
          ignoreUndefined: true
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
        path,
        cidBase,
        timeout
      }
    } = request

    const cid = await ipfs.files.flush(path, {
      signal,
      timeout
    })

    return h.response({
      Cid: cidToString(cid, { base: cidBase, upgrade: false })
    })
  }
}

module.exports = mfsFlush
