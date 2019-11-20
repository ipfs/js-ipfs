'use strict'

const callbackify = require('callbackify')
const { concatify } = require('../lib/converters')

module.exports = config => ({
  data: callbackify.variadic(concatify(require('./data')(config))),
  get: callbackify.variadic(require('./get')(config)),
  links: callbackify.variadic(require('./links')(config)),
  new: callbackify.variadic(require('./new')(config)),
  patch: require('./patch')(config),
  put: callbackify.variadic(require('./put')(config)),
  stat: callbackify.variadic(require('./stat')(config))
})
