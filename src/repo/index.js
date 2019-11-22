'use strict'

const callbackify = require('callbackify')
const { collectify } = require('../lib/converters')

module.exports = config => ({
  gc: callbackify.variadic(collectify(require('./gc')(config))),
  stat: callbackify.variadic(require('./stat')(config)),
  version: callbackify.variadic(require('./version')(config))
})
