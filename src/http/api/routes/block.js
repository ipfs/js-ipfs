'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/block/get',
    config: {
      pre: [
        { method: resources.block.get.parseArgs, assign: 'args' }
      ],
      handler: resources.block.get.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/block/put',
    config: {
      payload: {
        parse: false,
        output: 'stream'
      },
      pre: [
        { method: resources.block.put.parseArgs, assign: 'args' }
      ],
      handler: resources.block.put.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/block/del',
    config: {
      pre: [
        { method: resources.block.del.parseArgs, assign: 'args' }
      ],
      handler: resources.block.del.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/block/stat',
    config: {
      pre: [
        { method: resources.block.stat.parseArgs, assign: 'args' }
      ],
      handler: resources.block.stat.handler
    }
  })
}
