'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/object/new',
    config: {
      handler: resources.object.new.handler,
      validate: resources.object.new.validate
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/object/get',
    config: {
      pre: [
        { method: resources.object.get.parseArgs, assign: 'args' }
      ],
      handler: resources.object.get.handler,
      validate: resources.object.get.validate
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
      handler: resources.object.put.handler,
      validate: resources.object.put.validate
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/object/stat',
    config: {
      pre: [
        { method: resources.object.stat.parseArgs, assign: 'args' }
      ],
      handler: resources.object.stat.handler,
      validate: resources.object.stat.validate
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
      handler: resources.object.links.handler,
      validate: resources.object.links.validate
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
      handler: resources.object.patchAppendData.handler,
      validate: resources.object.patchAppendData.validate
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
      handler: resources.object.patchSetData.handler,
      validate: resources.object.patchSetData.validate
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/object/patch/add-link',
    config: {
      pre: [
        { method: resources.object.patchAddLink.parseArgs, assign: 'args' }
      ],
      handler: resources.object.patchAddLink.handler,
      validate: resources.object.patchAddLink.validate
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/object/patch/rm-link',
    config: {
      pre: [
        { method: resources.object.patchRmLink.parseArgs, assign: 'args' }
      ],
      handler: resources.object.patchRmLink.handler,
      validate: resources.object.patchRmLink.validate
    }
  })
}
