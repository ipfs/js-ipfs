'use strict'

module.exports = config => ({
  wantlist: require('./wantlist')(config),
  stat: require('./stat')(config),
  unwant: require('./unwant')(config)
})
