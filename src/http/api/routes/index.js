'use strict'

module.exports = [
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
  // require('./bitswap')(server)
  // require('./file')(server)
  ...require('./files-regular'),
  ...require('ipfs-mfs/http')
  // require('./pubsub')(server)
  // require('./debug')(server)
  // require('./webui')(server)
  // require('./dns')(server)
  // require('./key')(server)
  // require('./stats')(server)
  // require('./resolve')(server)
  // require('./name')(server)
]
