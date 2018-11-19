'use strict'

const resources = require('./../resources')
const mfs = require('ipfs-mfs/http')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    // TODO fix method
    method: '*',
    path: '/api/v0/cat',
    config: {
      pre: [
        { method: resources.cat.parseArgs, assign: 'args' }
      ],
      handler: resources.cat.handler
    }
  })

  api.route({
    // TODO fix method
    method: '*',
    path: '/api/v0/get',
    config: {
      pre: [
        { method: resources.get.parseArgs, assign: 'args' }
      ],
      handler: resources.get.handler
    }
  })

  api.route({
    // TODO fix method
    method: '*',
    path: '/api/v0/add',
    config: {
      payload: {
        parse: false,
        output: 'stream',
        maxBytes: Number.MAX_SAFE_INTEGER
      },
      handler: resources.add.handler,
      validate: resources.add.validate
    }
  })

  api.route({
    // TODO fix method
    method: '*',
    path: '/api/v0/ls',
    config: {
      pre: [
        { method: resources.files.immutableLs.parseArgs, assign: 'args' }
      ],
      handler: resources.files.immutableLs.handler
    }
  })

  mfs(api)
}
