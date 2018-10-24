'use strict'

const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return {
    publish: require('./publish')(send),
    resolve: require('./resolve')(send),
    pubsub: require('./pubsub')(send)
  }
}
