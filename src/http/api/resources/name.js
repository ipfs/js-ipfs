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
    const { arg } = request.query

    ipfs.name.resolve(arg, request.query, (err, res) => {
      if (err) {
        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      return reply({
        Path: res.path
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
      key: Joi.string().default('self')
    }).unknown()
  },
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const { arg } = request.query

    ipfs.name.publish(arg, request.query, (err, res) => {
      if (err) {
        return reply({
          Message: err.toString(),
          Code: 0
        }).code(500)
      }

      return reply({
        Name: res.name,
        Value: res.value
      }).code(200)
    })
  }
}

exports.pubsub = {
  state: {
    handler: (request, reply) => {
      const ipfs = request.server.app.ipfs

      ipfs.name.pubsub.state((err, res) => {
        if (err) {
          return reply({
            Message: err.toString(),
            Code: 0
          }).code(500)
        }

        return reply({
          Enabled: res.enabled
        }).code(200)
      })
    }
  },
  subs: {
    handler: (request, reply) => {
      const ipfs = request.server.app.ipfs

      ipfs.name.pubsub.subs((err, res) => {
        if (err) {
          return reply({
            Message: err.toString(),
            Code: 0
          }).code(500)
        }

        return reply({
          Strings: res
        }).code(200)
      })
    }
  },
  cancel: {
    validate: {
      query: Joi.object().keys({
        arg: Joi.string().required()
      }).unknown()
    },
    handler: (request, reply) => {
      const ipfs = request.server.app.ipfs
      const { arg } = request.query

      ipfs.name.pubsub.cancel(arg, (err, res) => {
        if (err) {
          return reply({
            Message: err.toString(),
            Code: 0
          }).code(500)
        }

        return reply({
          Canceled: res.canceled
        }).code(200)
      })
    }
  }
}
