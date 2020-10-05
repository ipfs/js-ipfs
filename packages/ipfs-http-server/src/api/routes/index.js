'use strict'

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

// @ts-ignore - two routes array seem to inferred as diff types
module.exports = routes.concat(extraRoutes)
