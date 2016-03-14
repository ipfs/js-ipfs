const resources = require('./../resources')

// TODO: add `object patch` endpoints, once spec is finished, check
// https://github.com/ipfs/js-ipfs/issues/58 & https://github.com/ipfs/http-api-spec/pull/32
// for more info

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/object/new',
    config: {
      pre: [
        { method: resources.object.new.parseArgs, assign: 'args' }
      ],
      handler: resources.object.new.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/object/get',
    config: {
      pre: [
        { method: resources.object.get.parseArgs, assign: 'args' }
      ],
      handler: resources.object.get.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/object/put',
    config: {
      payload: {
        parse: false,
        output: 'stream'
      },
      pre: [
        { method: resources.object.put.parseArgs, assign: 'args' }
      ],
      handler: resources.object.put.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/object/stat',
    config: {
      pre: [
        { method: resources.object.stat.parseArgs, assign: 'args' }
      ],
      handler: resources.object.stat.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/object/data',
    config: {
      pre: [
        { method: resources.object.data.parseArgs, assign: 'args' }
      ],
      handler: resources.object.data.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/object/links',
    config: {
      pre: [
        { method: resources.object.links.parseArgs, assign: 'args' }
      ],
      handler: resources.object.links.handler
    }
  })
}
