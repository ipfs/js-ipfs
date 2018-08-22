'use strict'

const Joi = require('joi')
const debug = require('debug')

const log = debug('jsipfs:http-api:resolve')
log.error = debug('jsipfs:http-api:resolve:error')

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
      arg: Joi.string().required()
    }).unknown()
  },
  handler (request, reply) {
    const ipfs = request.server.app.ipfs
    const name = request.query.arg
    const recursive = request.query.r || request.query.recursive || false

    log(name, { recursive })

    ipfs.resolve(name, { recursive }, (err, res) => {
      if (err) {
        log.error(err)
        return reply({ Message: err.message, Code: 0 }).code(500)
      }
      reply({ Path: res })
    })
  }
}
