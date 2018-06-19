'use strict'

const Joi = require('joi')

exports = module.exports

exports.resolve = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string(),
      nocache: Joi.boolean().default(false),
      recursive: Joi.boolean().default(false)
    }).unknown()
  },
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const { arg, nocache, recursive } = request.query

    ipfs.name.resolve(arg, nocache, recursive, (err, res) => {
      if (err) {
        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      return reply({
        Path: res
      }).code(200)
    })
  }
}

exports.publish = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string().required(),
      resolve: Joi.boolean().default(true),
      lifetime: Joi.string().default('24h'),
      ttl: Joi.string(),
      key: Joi.string().default('self')
    }).unknown()
  },
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const { arg, resolve, lifetime, ttl, key } = request.query

    ipfs.name.publish(arg, resolve, lifetime, ttl, key, (err, res) => {
      if (err) {
        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      return reply({
        Name: res,
        Value: arg
      }).code(200)
    })
  }
}
