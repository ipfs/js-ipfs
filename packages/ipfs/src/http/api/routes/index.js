'use strict'

const Boom = require('@hapi/boom')

const METHODS = [
  'GET',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS'
]

const routes = [
  require('./version'),
  require('./shutdown'),
  require('./id'),
  ...require('./bootstrap'),
  ...require('./block'),
  ...require('./object'),
  ...require('./pin'),
  ...require('./repo'),
  ...require('./config'),
  require('./ping'),
  ...require('./swarm'),
  ...require('./bitswap'),
  ...require('./files-regular'),
  ...require('./files'),
  ...require('./pubsub'),
  require('./debug'),
  ...require('./webui'),
  ...require('./dag'),
  require('./dns'),
  ...require('./key'),
  ...require('./stats'),
  require('./resolve'),
  ...require('./name'),
  ...require('./dht')
]

const extraRoutes = []

const handler = () => {
  throw Boom.methodNotAllowed()
}

METHODS.forEach(method => {
  routes.forEach(route => {
    extraRoutes.push({
      method,
      handler,
      path: route.path
    })
  })
})

module.exports = routes.concat(extraRoutes)
