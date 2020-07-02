'use strict'

module.exports = config => ({
  wantlist: require('./wantlist')(config),
  wantlistForPeer: require('./wantlist-for-peer')(config),
  stat: require('./stat')(config),
  unwant: require('./unwant')(config)
})
