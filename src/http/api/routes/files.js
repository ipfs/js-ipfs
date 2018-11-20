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
        { method: resources.filesRegular.cat.parseArgs, assign: 'args' }
      ],
      handler: resources.filesRegular.cat.handler
    }
  })

  api.route({
    // TODO fix method
    method: '*',
    path: '/api/v0/get',
    config: {
      pre: [
        { method: resources.filesRegular.get.parseArgs, assign: 'args' }
      ],
      handler: resources.filesRegular.get.handler
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
      handler: resources.filesRegular.add.handler,
      validate: resources.filesRegular.add.validate
    }
  })

  api.route({
    // TODO fix method
    method: '*',
    path: '/api/v0/ls',
    config: {
      pre: [
        { method: resources.filesRegular.ls.parseArgs, assign: 'args' }
      ],
      handler: resources.filesRegular.ls.handler
    }
  })

  mfs(api)
}
