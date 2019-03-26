'use strict'

const debug = require('debug')
const get = require('dlv')
const set = require('just-safe-set')
const log = debug('ipfs:http-api:config')
log.error = debug('ipfs:http-api:config:error')
const multipart = require('ipfs-multipart')
const Boom = require('boom')

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

    const fileStream = await new Promise((resolve, reject) => {
      multipart.reqParser(request.payload)
        .on('file', (fileName, fileStream) => resolve(fileStream))
        .on('end', () => reject(Boom.badRequest("Argument 'file' is required")))
    })

    const file = await new Promise((resolve, reject) => {
      fileStream
        .on('data', data => resolve(data))
        .on('end', () => reject(Boom.badRequest("Argument 'file' is required")))
    })

    try {
      return { config: JSON.parse(file.toString()) }
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
