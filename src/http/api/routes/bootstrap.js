'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  // https://github.com/ipfs/http-api-spec/blob/master/apiary.apib#L818
  api.route({
    method: '*',
    path: '/api/v0/bootstrap',
    config: {
      handler: resources.bootstrap.list
    }
  })

  // https://github.com/ipfs/http-api-spec/blob/master/apiary.apib#L866
  api.route({
    method: '*',
    path: '/api/v0/bootstrap/add',
    config: {
      pre: [
        { method: resources.bootstrap.add.parseArgs, assign: 'args' }
      ],
      handler: resources.bootstrap.add.handler
    }
  })

  // https://github.com/ipfs/http-api-spec/blob/master/apiary.apib#L1081
  api.route({
    method: '*',
    path: '/api/v0/bootstrap/list',
    handler: resources.bootstrap.list
  })

  // https://github.com/ipfs/http-api-spec/blob/master/apiary.apib#L1131
  api.route({
    method: '*',
    path: '/api/v0/bootstrap/rm',
    config: {
      pre: [
        { method: resources.bootstrap.rm.parseArgs, assign: 'args' }
      ],
      handler: resources.bootstrap.rm.handler
    }
  })
}
