'use strict'

const debug = require('debug')
const get = require('dlv')
const set = require('just-safe-set')
const log = debug('ipfs:http-api:config')
log.error = debug('ipfs:http-api:config:error')
const multipart = require('ipfs-multipart')
const Boom = require('@hapi/boom')
const Joi = require('@hapi/joi')
const { profiles } = require('../../../core/components/config')
const all = require('async-iterator-all')

exports.getOrSet = {
  // pre request handler that parses the args and returns `key` & `value` which are assigned to `request.pre.args`
  parseArgs (request, h) {
    const parseValue = (args) => {
      if (request.query.bool !== undefined) {
        args.value = args.value === 'true'
      } else if (request.query.json !== undefined) {
        try {
          args.value = JSON.parse(args.value)
        } catch (err) {
          log.error(err)
          throw Boom.badRequest('failed to unmarshal json. ' + err)
        }
      }

      return args
    }

    if (request.query.arg instanceof Array) {
      return parseValue({
        key: request.query.arg[0],
        value: request.query.arg[1]
      })
    }

    if (request.params.key) {
      return parseValue({
        key: request.params.key,
        value: request.query.arg
      })
    }

    if (!request.query.arg) {
      throw Boom.badRequest("Argument 'key' is required")
    }

    return { key: request.query.arg }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { key } = request.pre.args
    let { value } = request.pre.args

    // check that value exists - typeof null === 'object'
    if (value && (typeof value === 'object' &&
        value.type === 'Buffer')) {
      throw Boom.badRequest('Invalid value type')
    }

    let originalConfig
    try {
      originalConfig = await ipfs.config.get()
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to get config value' })
    }

    if (value === undefined) {
      // Get the value of a given key
      value = get(originalConfig, key)
      if (value === undefined) {
        throw Boom.notFound('Failed to get config value: key has no attributes')
      }
    } else {
      // Set the new value of a given key
      const result = set(originalConfig, key, value)
      if (!result) {
        throw Boom.badRequest('Failed to set config value')
      }
      try {
        await ipfs.config.replace(originalConfig)
      } catch (err) {
        throw Boom.boomify(err, { message: 'Failed to replace config value' })
      }
    }

    return h.response({
      Key: key,
      Value: value
    })
  }
}

exports.get = async (request, h) => {
  const { ipfs } = request.server.app

  let config
  try {
    config = await ipfs.config.get()
  } catch (err) {
    throw Boom.boomify(err, { message: 'Failed to get config value' })
  }

  return h.response({
    Value: config
  })
}

exports.show = async (request, h) => {
  const { ipfs } = request.server.app

  let config
  try {
    config = await ipfs.config.get()
  } catch (err) {
    throw Boom.boomify(err, { message: 'Failed to get config value' })
  }

  return h.response(config)
}

exports.replace = {
  // pre request handler that parses the args and returns `config` which is assigned to `request.pre.args`
  async parseArgs (request, h) {
    if (!request.payload) {
      throw Boom.badRequest("Argument 'file' is required")
    }

    let file

    for await (const part of multipart(request)) {
      if (part.type !== 'file') {
        continue
      }

      file = Buffer.concat(await all(part.content))
    }

    if (!file) {
      throw Boom.badRequest("Argument 'file' is required")
    }

    try {
      return { config: JSON.parse(file.toString('utf8')) }
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to decode file as config' })
    }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { config } = request.pre.args

    try {
      await ipfs.config.replace(config)
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to save config' })
    }

    return h.response()
  }
}

exports.profiles = {
  apply: {
    validate: {
      query: Joi.object().keys({
        'dry-run': Joi.boolean().default(false)
      }).unknown()
    },

    // pre request handler that parses the args and returns `profile` which is assigned to `request.pre.args`
    parseArgs: function (request, h) {
      if (!request.query.arg) {
        throw Boom.badRequest("Argument 'profile' is required")
      }

      if (!profiles[request.query.arg]) {
        throw Boom.badRequest("Argument 'profile' is not a valid profile name")
      }

      return { profile: request.query.arg }
    },

    handler: async function (request, h) {
      const { ipfs } = request.server.app
      const { profile } = request.pre.args
      const dryRun = request.query['dry-run']

      try {
        const diff = await ipfs.config.profiles.apply(profile, { dryRun })

        return h.response({ OldCfg: diff.original, NewCfg: diff.updated })
      } catch (err) {
        throw Boom.boomify(err, { message: 'Failed to apply profile' })
      }
    }
  },
  list: {
    handler: async function (request, h) {
      const { ipfs } = request.server.app
      const list = await ipfs.config.profiles.list()

      return h.response(
        list.map(profile => ({
          Name: profile.name,
          Description: profile.description
        }))
      )
    }
  }
}
