'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: '*',
    path: '/api/v0/object/new',
    options: {
      validate: resources.object.new.validate
    },
    handler: resources.object.new.handler
  },
  {
    method: '*',
    path: '/api/v0/object/get',
    options: {
      pre: [
        { method: resources.object.get.parseArgs, assign: 'args' }
      ],
      validate: resources.object.get.validate
    },
    handler: resources.object.get.handler
  },
  {
    method: '*',
    path: '/api/v0/object/put',
    options: {
      payload: {
        parse: false,
        output: 'stream'
      },
      pre: [
        { method: resources.object.put.parseArgs, assign: 'args' }
      ],
      validate: resources.object.put.validate
    },
    handler: resources.object.put.handler
  },
  {
    method: '*',
    path: '/api/v0/object/stat',
    options: {
      pre: [
        { method: resources.object.stat.parseArgs, assign: 'args' }
      ],
      validate: resources.object.stat.validate
    },
    handler: resources.object.stat.handler
  },
  {
    method: '*',
    path: '/api/v0/object/data',
    options: {
      pre: [
        { method: resources.object.data.parseArgs, assign: 'args' }
      ]
    },
    handler: resources.object.data.handler
  },
  {
    method: '*',
    path: '/api/v0/object/links',
    options: {
      pre: [
        { method: resources.object.links.parseArgs, assign: 'args' }
      ],
      validate: resources.object.links.validate
    },
    handler: resources.object.links.handler
  },
  {
    method: '*',
    path: '/api/v0/object/patch/append-data',
    options: {
      payload: {
        parse: false,
        output: 'stream'
      },
      pre: [
        { method: resources.object.patchAppendData.parseArgs, assign: 'args' }
      ],
      validate: resources.object.patchAppendData.validate
    },
    handler: resources.object.patchAppendData.handler
  },
  {
    method: '*',
    path: '/api/v0/object/patch/set-data',
    options: {
      payload: {
        parse: false,
        output: 'stream'
      },
      pre: [
        { method: resources.object.patchSetData.parseArgs, assign: 'args' }
      ],
      validate: resources.object.patchSetData.validate
    },
    handler: resources.object.patchSetData.handler
  },
  {
    method: '*',
    path: '/api/v0/object/patch/add-link',
    options: {
      pre: [
        { method: resources.object.patchAddLink.parseArgs, assign: 'args' }
      ],
      validate: resources.object.patchAddLink.validate
    },
    handler: resources.object.patchAddLink.handler
  },
  {
    method: '*',
    path: '/api/v0/object/patch/rm-link',
    options: {
      pre: [
        { method: resources.object.patchRmLink.parseArgs, assign: 'args' }
      ],
      validate: resources.object.patchRmLink.validate
    },
    handler: resources.object.patchRmLink.handler
  }
]
