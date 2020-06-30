'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/config/{key?}',
    ...resources.config.getOrSet
  },
  {
    method: 'POST',
    path: '/api/v0/config/show',
    ...resources.config.show
  },
  {
    method: 'POST',
    path: '/api/v0/config/replace',
    ...resources.config.replace
  },
  {
    method: 'POST',
    path: '/api/v0/config/profile/apply',
    ...resources.config.profiles.apply
  },
  {
    method: 'POST',
    path: '/api/v0/config/profile/list',
    ...resources.config.profiles.list
  }
]
