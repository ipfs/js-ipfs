'use strict'

module.exports = config => ({
  get: require('./get')(config),
  put: require('./put')(config),
  findProvs: require('./find-provs')(config),
  findPeer: require('./find-peer')(config),
  provide: require('./provide')(config),
  // find closest peerId to given peerId
  query: require('./query')(config)
})
