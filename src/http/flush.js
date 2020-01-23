'use strict'

const Joi = require('@hapi/joi')

const {
  FILE_SEPARATOR
} = require('../core/utils/constants')

const mfsFlush = {
  method: 'POST',
  path: '/api/v0/files/flush',
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      cidBase
    } = request.query

    let cid = await ipfs.files.flush(arg || FILE_SEPARATOR, {})

    if (cidBase && cidBase !== 'base58btc' && cid.version === 0) {
      cid = cid.toV1()
    }

    return h.response({
      Cid: cid.toString(cidBase)
    })
  },
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string(),
        cidBase: Joi.string()
      })
    }
  }
}

module.exports = mfsFlush
