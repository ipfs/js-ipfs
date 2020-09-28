'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/object/new',
    ...resources.object.new
  },
  {
    method: 'POST',
    path: '/api/v0/object/get',
    ...resources.object.get
  },
  {
    method: 'POST',
    path: '/api/v0/object/put',
    ...resources.object.put
  },
  {
    method: 'POST',
    path: '/api/v0/object/stat',
    ...resources.object.stat
  },
  {
    method: 'POST',
    path: '/api/v0/object/data',
    ...resources.object.data
  },
  {
    method: 'POST',
    path: '/api/v0/object/links',
    ...resources.object.links
  },
  {
    method: 'POST',
    path: '/api/v0/object/patch/append-data',
    ...resources.object.patchAppendData
  },
  {
    method: 'POST',
    path: '/api/v0/object/patch/set-data',
    ...resources.object.patchSetData
  },
  {
    method: 'POST',
    path: '/api/v0/object/patch/add-link',
    ...resources.object.patchAddLink
  },
  {
    method: 'POST',
    path: '/api/v0/object/patch/rm-link',
    ...resources.object.patchRmLink
  }
]
