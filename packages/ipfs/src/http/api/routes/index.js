'use strict'

const Boom = require('@hapi/boom')

// RPC API requires POST, we block every other method
const BLOCKED_METHODS = [
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
  ...require('./dag'),
  require('./dns'),
  ...require('./key'),
  ...require('./stats'),
  require('./resolve'),
  ...require('./name'),
  ...require('./dht')
]

// webui is loaded from API port, but works over GET (not a part of RPC API)
const extraRoutes = [...require('./webui')]

const handler = () => {
  throw Boom.methodNotAllowed()
}

// add routes that return HTTP 504 for non-POST requests to RPC API
BLOCKED_METHODS.forEach(method => {
  routes.forEach(route => {
    extraRoutes.push({
      method,
      handler,
      path: route.path
    })
  })
})

module.exports = routes.concat(extraRoutes)
