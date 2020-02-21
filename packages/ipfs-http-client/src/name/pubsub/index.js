'use strict'

module.exports = config => ({
  cancel: require('./cancel')(config),
  state: require('./state')(config),
  subs: require('./subs')(config)
})
