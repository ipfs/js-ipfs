'use strict'

const Joi = require('@hapi/joi')
const debug = require('debug')
const multibase = require('multibase')

const log = debug('ipfs:http-api:resolve')
log.error = debug('ipfs:http-api:resolve:error')

module.exports = {
  validate: {
    query: Joi.object().keys({
      r: Joi.alternatives()
        .when('recursive', {
          is: Joi.any().exist(),
          then: Joi.any().forbidden(),
          otherwise: Joi.boolean()
        }),
      recursive: Joi.boolean(),
      arg: Joi.string().required(),
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },
  async handler (request, h) {
    const { ipfs } = request.server.app
    const name = request.query.arg
    const recursive = request.query.r || request.query.recursive || true
    const cidBase = request.query['cid-base']

    log(name, { recursive, cidBase })
    const res = await ipfs.resolve(name, { recursive, cidBase })

    return h.response({ Path: res })
  }
}
