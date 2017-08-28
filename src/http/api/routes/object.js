'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/object/new',
    config: {
      handler: resources.object.new
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

  api.route({
    method: '*',
    path: '/api/v0/object/patch/append-data',
    config: {
      payload: {
        parse: false,
        output: 'stream'
      },
      pre: [
        { method: resources.object.patchAppendData.parseArgs, assign: 'args' }
      ],
      handler: resources.object.patchAppendData.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/object/patch/set-data',
    config: {
      payload: {
        parse: false,
        output: 'stream'
      },
      pre: [
        { method: resources.object.patchSetData.parseArgs, assign: 'args' }
      ],
      handler: resources.object.patchSetData.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/object/patch/add-link',
    config: {
      pre: [
        { method: resources.object.patchAddLink.parseArgs, assign: 'args' }
      ],
      handler: resources.object.patchAddLink.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/object/patch/rm-link',
    config: {
      pre: [
        { method: resources.object.patchRmLink.parseArgs, assign: 'args' }
      ],
      handler: resources.object.patchRmLink.handler
    }
  })
}
