'use strict'

const debug = require('debug')
const get = require('lodash.get')
const set = require('lodash.set')
const log = debug('jsipfs:http-api:config')
log.error = debug('jsipfs:http-api:config:error')
const multipart = require('ipfs-multipart')

exports = module.exports

exports.getOrSet = {
  // pre request handler that parses the args and returns `key` & `value` which are assigned to `request.pre.args`
  parseArgs: (request, reply) => {
    const parseValue = (args) => {
      if (request.query.bool !== undefined) {
        args.value = args.value === 'true'
      } else if (request.query.json !== undefined) {
        try {
          args.value = JSON.parse(args.value)
        } catch (err) {
          log.error(err)
          return reply({
            Message: 'failed to unmarshal json. ' + err,
            Code: 0
          }).code(500).takeover()
        }
      }

      return reply(args)
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
      return reply("Argument 'key' is required").code(400).takeover()
    }

    return reply({
      key: request.query.arg
    })
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const value = request.pre.args.value
    const ipfs = request.server.app.ipfs

    // check that value exists - typeof null === 'object'
    if (value && (typeof value === 'object' &&
        value.type === 'Buffer')) {
      return reply({
        Message: 'Invalid value type',
        Code: 0
      }).code(500)
    }

    if (value === undefined) {
      // Get the value of a given key
      return ipfs.config.get((err, config) => {
        if (err) {
          log.error(err)
          return reply({
            Message: 'Failed to get config value: ' + err,
            Code: 0
          }).code(500)
        }

        const value = get(config, key)
        if (value === undefined) {
          return reply({
            Message: 'Failed to get config value:  key has no attributes',
            Code: 0
          }).code(500)
        }

        return reply({
          Key: key,
          Value: value
        })
      })
    }

    // Set the new value of a given key
    ipfs.config.get((err, originalConfig) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get config value: ' + err,
          Code: 0
        }).code(500)
      }

      const updatedConfig = set(originalConfig, key, value)
      ipfs.config.replace(updatedConfig, (err) => {
        if (err) {
          log.error(err)
          return reply({
            Message: 'Failed to get config value: ' + err,
            Code: 0
          }).code(500)
        }

        return reply({
          Key: key,
          Value: value
        })
      })
    })
  }
}

exports.get = (request, reply) => {
  const ipfs = request.server.app.ipfs

  ipfs.config.get((err, config) => {
    if (err) {
      log.error(err)
      return reply({
        Message: 'Failed to get config value: ' + err,
        Code: 0
      }).code(500)
    }

    return reply({
      Value: config
    })
  })
}

exports.show = (request, reply) => {
  const ipfs = request.server.app.ipfs

  ipfs.config.get((err, config) => {
    if (err) {
      log.error(err)
      return reply({
        Message: 'Failed to get config value: ' + err,
        Code: 0
      }).code(500)
    }

    return reply(config)
  })
}

exports.replace = {
  // pre request handler that parses the args and returns `config` which is assigned to `request.pre.args`
  parseArgs: (request, reply) => {
    if (!request.payload) {
      return reply({
        Message: "Argument 'file' is required",
        Code: 1123

      }).code(400).takeover()
    }

    const parser = multipart.reqParser(request.payload)
    var file

    parser.on('file', (fileName, fileStream) => {
      fileStream.on('data', (data) => {
        file = data
      })
    })

    parser.on('end', () => {
      if (!file) {
        return reply({
          Message: "Argument 'file' is required",
          Code: 1123

        }).code(400).takeover()
      }

      try {
        return reply({
          config: JSON.parse(file.toString())
        })
      } catch (err) {
        return reply({
          Message: 'Failed to decode file as config: ' + err,
          Code: 0
        }).code(500).takeover()
      }
    })
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    return request.server.app.ipfs.config.replace(request.pre.args.config, (err) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to save config: ' + err,
          Code: 0
        }).code(500)
      }

      return reply()
    })
  }
}
