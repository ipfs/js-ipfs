'use strict'

module.exports = (server) => {
  require('./version')(server)
  require('./id')(server)
  require('./bootstrap')(server)
  require('./block')(server)
  require('./object')(server)
  // require('./repo')(server)
  require('./config')(server)
  require('./swarm')(server)
  require('./bitswap')(server)
  require('./file')(server)
  require('./files')(server)
  require('./pubsub')(server)
  require('./debug')(server)
  require('./webui')(server)
  require('./dns')(server)
}
