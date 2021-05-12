'use strict'

/**
 * @param {import('../types').Options} config
 */
module.exports = config => ({
  data: require('./data')(config),
  get: require('./get')(config),
  links: require('./links')(config),
  new: require('./new')(config),
  patch: require('./patch')(config),
  put: require('./put')(config),
  stat: require('./stat')(config)
})
